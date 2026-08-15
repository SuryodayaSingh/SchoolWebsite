import { Resend } from "resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    console.log("EMAIL FUNCTION STARTED");
    console.log("RESEND API KEY EXISTS:", !!process.env.RESEND_API_KEY);
    console.log("OTP SENDING TO:", email);

    const { data, error } = await resend.emails.send({
      from: "Kisaan Inter College <onboarding@resend.dev>",
      to: email,
      subject: "Verification Code",
      react: VerificationEmail({
        username,
        otp: verifyCode,
      }),
    });

    console.log("RESEND DATA:", data);
    console.log("RESEND ERROR:", error);

    if (error) {
      console.error("RESEND EMAIL ERROR:", error);

      return {
        success: false,
        message: error.message || "Failed to send verification email",
      };
    }

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