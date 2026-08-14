import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";

export async function POST(request: Request) {
  try {
    console.log("STEP 1: Route started");

    if (!process.env.Mongo_url) {
      return Response.json(
        {
          success: false,
          message: "ERROR: Mongo_url environment variable is missing",
        },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        {
          success: false,
          message: "ERROR: RESEND_API_KEY environment variable is missing",
        },
        { status: 500 }
      );
    }

    console.log("STEP 2: Environment variables found");

    await dbConnect();

    console.log("STEP 3: Database connected");

    const body = await request.json();
    const { identifier, password } = body;

    console.log("STEP 4: Request body received");

    if (!identifier || !password) {
      return Response.json(
        {
          success: false,
          message: "Phone number and password are required",
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

    console.log("STEP 5: User search completed");

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

    console.log("STEP 6: Checking password");

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

    console.log("STEP 7: Password correct");

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verifyCode = otp;
    user.verifyCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.loginOtpVerified = false;

    await user.save();

    console.log("STEP 8: OTP saved");

    const emailResponse = await resend.emails.send({
      from: "Kisan Inter College <onboarding@resend.dev>",
      to: "surya945514@gmail.com",
      subject: "Your Login Verification Code",
      react: VerificationEmail({
        username: user.username,
        otp,
        type: "login",
      }),
    });

    console.log("STEP 9: Email response received");

    if (emailResponse.error) {
      return Response.json(
        {
          success: false,
          message: `Email error: ${emailResponse.error.message}`,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND LOGIN OTP ERROR:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? `Server error: ${error.message}`
            : "Unknown server error",
      },
      { status: 500 }
    );
  }
}