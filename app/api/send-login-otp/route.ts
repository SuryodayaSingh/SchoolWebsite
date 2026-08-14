import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    console.log("LOGIN OTP REQUEST BODY:", body);

    const { identifier, password } = body;

    // Check required fields
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

    console.log(
      "SEARCHING USER WITH IDENTIFIER:",
      cleanIdentifier
    );

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

    // Account should already be verified during signup
    if (!user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "Please verify your account first",
        },
        { status: 401 }
      );
    }

    // Verify password
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

    // Generate a new OTP for EVERY login
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP valid for 5 minutes
    const otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Save fresh login OTP
    user.verifyCode = otp;
    user.verifyCodeExpiry = otpExpiry;
    user.loginOtpVerified = false;

    await user.save();

    console.log("LOGIN OTP GENERATED FOR:", user.email);

    // Send OTP to registered email
    const emailResponse = await resend.emails.send({
      from: "Kisan Inter College <onboarding@resend.dev>",
      to: "surya945514@gmail.com",
      subject: "Your Login Verification Code",
      react: VerificationEmail({
        username: user.username,
        otp,
      }),
    });

    console.log("EMAIL RESPONSE:", emailResponse);

    if (emailResponse.error) {
      console.error(
        "RESEND EMAIL ERROR:",
        emailResponse.error
      );

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