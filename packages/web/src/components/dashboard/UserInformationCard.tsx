/* eslint-disable relay/unused-fields */
import { graphql, useFragment } from "react-relay";
import type { UserInformationCard_user$key } from "./__generated__/UserInformationCard_user.graphql";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { useAuthStore } from "@/modules/auth/stores";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type UserInformationCardProps = {
  user: UserInformationCard_user$key;
};

export function UserInformationCard({ user }: UserInformationCardProps) {
  const { name, email, picture } = useFragment<UserInformationCard_user$key>(
    graphql`
      fragment UserInformationCard_user on User {
        id
        name
        email
        picture
      }
    `,
    user,
  );
  const { clearToken } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/auth/login");
    toast.success("Logged out successfully");
  }

  return (
    <div
      data-testid="user-information-card"
      className="flex w-full justify-between flex-row items-center gap-2 rounded-xl ring-1 ring-black/10 text-black bg-black/5 p-4"
    >
      <div className="flex flex-row gap-2 items-center">
        <Avatar className="border border-white !text-black bg-white ring-1 ring-black/20 flex items-center justify-center">
          {picture && <AvatarImage className="object-cover" src={picture} />}
          <AvatarFallback>{name?.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold w-32">{name}</span>
          <span className="text-xs">{email}</span>
        </div>
      </div>
      <Button className="cursor-pointer ml-4" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
