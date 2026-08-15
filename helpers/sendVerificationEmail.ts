import { Resend } from "resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  phone: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
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
    console.log("OTP SENDING TO:", email);

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
      message: "Failed to send verification email",
    };
  }
}