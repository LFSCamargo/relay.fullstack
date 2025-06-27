/* eslint-disable relay/unused-fields */
import { graphql } from "relay-runtime";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useFragment, useMutation } from "react-relay";
import type { EditUserProfileCard_user$key } from "./__generated__/EditUserProfileCard_user.graphql";
import { useForm } from "react-hook-form";
// import { Input } from "../ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { EditUserProfileCardMutation } from "./__generated__/EditUserProfileCardMutation.graphql";
import { toast } from "sonner";
import { useRef } from "react";
import { ImageResizing } from "@/utils";
import type { RecordSourceSelectorProxy } from "relay-runtime";
import { Button } from "../ui/button";

type Props = {
  user: EditUserProfileCard_user$key;
};

export function EditUserProfileCard({ user }: Props) {
  const pictureRef = useRef<HTMLInputElement>(null);
  const { name, picture } = useFragment<EditUserProfileCard_user$key>(
    graphql`
      fragment EditUserProfileCard_user on User {
        id
        name
        picture
      }
    `,
    user,
  );

  const [commit, isMutationInFlight] = useMutation<EditUserProfileCardMutation>(
    graphql`
      mutation EditUserProfileCardMutation($input: UpdateUserInput!) {
        updateUser(input: $input) {
          user {
            id
            name
            picture
            ...EditUserProfileCard_user
            ...UserInformationCard_user
          }
        }
      }
    `,
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: name ?? "",
      picture: picture ?? "",
    },

    resolver: zodResolver(
      z.object({
        name: z.string().min(1, { message: "Name cannot be empty" }),
        picture: z.string(),
      }),
    ),
  });

  const onSubmit = handleSubmit(async ({ name, picture }) => {
    const t = toast.loading("Updating profile...");

    commit({
      variables: {
        input: {
          name,
          picture: picture as string,
        },
      },
      updater: (store: RecordSourceSelectorProxy) => {
        const payload = store.getRootField("updateUser");
        if (!payload) {
          console.warn("No updateUser payload found in mutation response");
          return;
        }

        const updatedUser = payload.getLinkedRecord("user");

        const me = store.get("client:root")!.getLinkedRecord("me");

        me!.invalidateRecord();

        store.get("client:root")!.setLinkedRecord(updatedUser, "me");
      },
      onError: (error) => {
        console.log(error);

        toast.error(error.message, { id: t });
      },
      onCompleted: (data, errors) => {
        if (!data) return;
        if (errors) {
          toast.error(errors[0].message, { id: t });
          return;
        }
        const updatedUser = data.updateUser!.user;

        if (!updatedUser) {
          toast.error("An unexpected error occurred", { id: t });
          return;
        }

        reset({
          name: updatedUser.name,
          picture: updatedUser.picture ?? "",
        });

        toast.success("Profile updated successfully", { id: t });
      },
    });
  });

  const userImage = watch("picture");

  return (
    <div className="flex w-[320px] min-w-[320px] flex-col items-start rounded-xl ring-1 ring-black/10 text-black bg-black/5 p-4">
      <h1 className="font-semibold tracking-tight">Edit your Profile</h1>
      <p className="text-sm font-light">Change your avatar, name and email</p>

      <form onSubmit={onSubmit} className="w-full">
        <Avatar
          data-testid="avatar-edit-profile"
          onClick={() => pictureRef.current?.click()}
          className="border mt-4 w-44 h-44 border-white object-cover !text-black ring-1 ring-black/20 flex items-center justify-center"
        >
          {userImage && (
            <AvatarImage className="bg-cover object-cover" src={userImage} />
          )}
          <AvatarFallback className="text-2xl cursor-pointer bg-white">
            {name?.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <input
          data-testid="picture-input-edit-profile"
          type="file"
          {...register("picture")}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const compressdImage = await ImageResizing.compressImage(file);
            if (!compressdImage) {
              toast.error("Failed to compress image");
              return;
            }
            setValue("picture", compressdImage);
          }}
          className="hidden"
          accept="image/*"
          ref={pictureRef}
        />

        <input
          data-testid="name-input-edit-profile"
          className="flex flex-1 h-9 bg-white w-full rounded-md border border-input mt-4 px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          id="name"
          placeholder="Name"
          type="text"
          {...register("name")}
        />
        {errors.name && (
          <span className="text-red-500 text-xs mx-2 mb-1">
            {errors.name.message}
          </span>
        )}
        <Button
          disabled={!isDirty || isMutationInFlight}
          data-testid="save-profile-button"
          type="submit"
          className="bg-black w-full disabled:bg-black/50 text-sm text-white py-2 px-4 rounded-md mt-4 disabled:cursor-disabled"
        >
          Save your Profile
        </Button>
      </form>
    </div>
  );
}
