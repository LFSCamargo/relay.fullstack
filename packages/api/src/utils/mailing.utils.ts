import nodemailer from "nodemailer";

import { render } from "@react-email/render/dist/node";

import { ResetPasswordEmailTemplate } from "@relay.fullstack/mailing";

import { Env } from "../env";
import { GraphQLContext } from "../types/graphql.types";

const transporter = nodemailer.createTransport({
  host: Env.SMTP_HOST,
  port: Number(Env.SMTP_PORT),
  secure: Env.SMTP_SECURE === "true",
  ...(Env.SMTP_USER !== "" &&
    Env.SMTP_PASSWORD !== "" && {
      auth: {
        user: Env.SMTP_USER,
        pass: Env.SMTP_PASSWORD,
      },
    }),
});

export const MailingUtils = {
  sendResetPasswordEmail: async (
    to: string,
    otp: string,
    ctx: GraphQLContext,
  ): Promise<void> => {
    const { req } = ctx;

    console.log(req.headers, req.get("x-forwarded-for"));

    const requesterInfo = {
      ipAddress: req.headers.origin,
      userAgent: req.headers["user-agent"],
      location: req.headers["x-forwarded-for"] ? "behind proxy" : "direct",
      device: req.headers["user-agent"]?.includes("Mobile")
        ? "mobile"
        : "desktop",
    };

    const from = Env.SMTP_USER === "" ? "test@relay.dev" : Env.SMTP_USER;

    const emailContent = await render(
      ResetPasswordEmailTemplate({
        validationCode: otp,
        requesterInfo: {
          userAgent: requesterInfo.userAgent as string,
          location: requesterInfo.location as string,
          device: requesterInfo.device as string,
        },
      }),
      {
        pretty: false,
      },
    );

    await transporter.sendMail({
      from: from,
      to,
      subject: "Reset your password",
      html: emailContent,
    });
  },
};
