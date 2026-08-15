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
    try{
        await resend.emails.send({
            from: "Kisaan Inter College <onboarding@resend.dev>",
            to: email,
            subject: "Verification Code",
            react: VerificationEmail({username, otp: verifyCode}),
        });
        return {success: true, message: "Verification email sent successfuly "}
    } catch (emailError) {
        console.error("Error sending Verification Email", emailError)
        return {success: false, message: "Failed to send verification email"}
    }
}