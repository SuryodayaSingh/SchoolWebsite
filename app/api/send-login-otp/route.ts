import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const { identifier, password } = body;

    if (
      !identifier ||
      typeof identifier !== "string" ||
      !identifier.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Phone number is required",
        },
        { status: 400 }
      );
    }

    if (
      !password ||
      typeof password !== "string" ||
      !password.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Password is required",
        },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    const user = await UserModel.findOne({
      $or: [
        { phone: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() },
        { username: cleanIdentifier },
      ],
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "Please verify your account first",
        },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return Response.json(
        {
          success: false,
          message: "Incorrect password",
        },
        { status: 401 }
      );
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    user.verifyCode = otp;
    user.verifyCodeExpiry = otpExpiry;
    user.loginOtpVerified = false;

    await user.save();

    console.log("LOGIN OTP GENERATED FOR:", user.email);

    const emailResponse = await resend.emails.send({
      from: "Kisan Inter College <onboarding@resend.dev>",
      to: user.email,
      subject: "Your Login Verification Code",
      react: VerificationEmail({
        username: user.username,
        otp,
      }),
    });

    console.log("EMAIL RESPONSE:", emailResponse);

    if (emailResponse.error) {
      console.error("RESEND EMAIL ERROR:", emailResponse.error);

      return Response.json(
        {
          success: false,
          message:
            emailResponse.error.message ||
            "Failed to send OTP email",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "OTP has been sent to your registered email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SEND LOGIN OTP ERROR:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send login OTP",
      },
      { status: 500 }
    );
  }
}