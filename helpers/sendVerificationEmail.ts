import nodemailer from "nodemailer";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";
import { render } from "@react-email/render";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    console.log("EMAIL FUNCTION STARTED");
    console.log("GMAIL USER EXISTS:", !!process.env.GMAIL_USER);
    console.log(
      "GMAIL APP PASSWORD EXISTS:",
      !!process.env.GMAIL_APP_PASSWORD
    );
    console.log("OTP SENDING TO:", email);

    const emailHtml = await render(
      VerificationEmail({
        username,
        otp: verifyCode,
      })
    );

    const info = await transporter.sendMail({
      from: `"Kisaan Inter College" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verification Code - Kisaan Inter College",
      html: emailHtml,
    });

    console.log("EMAIL SENT SUCCESSFULLY:", info.messageId);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailError) {
    console.error("Error sending Verification Email:", emailError);

    return {
      success: false,
      message:
        emailError instanceof Error
          ? emailError.message
          : "Failed to send verification email",
    };
  }
}