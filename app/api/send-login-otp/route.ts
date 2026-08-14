import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";

export async function POST(request: Request) {
  try {
    // 1. ENV CHECK
    if (!process.env.Mongo_url) {
      return Response.json(
        { success: false, message: "Mongo_url missing" },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { success: false, message: "RESEND_API_KEY missing" },
        { status: 500 }
      );
    }

    // 2. DB CHECK
    try {
      await dbConnect();
    } catch (error) {
      console.error("DB ERROR:", error);
      return Response.json(
        {
          success: false,
          message: `Database error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    // 3. BODY CHECK
    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { identifier, password } = body;

    if (!identifier || !password) {
      return Response.json(
        {
          success: false,
          message: "Phone number and password are required",
        },
        { status: 400 }
      );
    }

    // 4. USER SEARCH
    let user;

    try {
      const cleanIdentifier = identifier.trim();

      user = await UserModel.findOne({
        $or: [
          { phone: cleanIdentifier },
          { email: cleanIdentifier.toLowerCase() },
          { username: cleanIdentifier },
        ],
      });
    } catch (error) {
      console.error("USER SEARCH ERROR:", error);

      return Response.json(
        {
          success: false,
          message: `User search error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
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

    // 5. PASSWORD CHECK
    let isPasswordCorrect;

    try {
      isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
      );
    } catch (error) {
      console.error("PASSWORD ERROR:", error);

      return Response.json(
        {
          success: false,
          message: `Password check error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    if (!isPasswordCorrect) {
      return Response.json(
        {
          success: false,
          message: "Incorrect password",
        },
        { status: 401 }
      );
    }

    // 6. GENERATE + SAVE OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    try {
      user.verifyCode = otp;
      user.verifyCodeExpiry = new Date(
        Date.now() + 5 * 60 * 1000
      );
      user.loginOtpVerified = false;

      await user.save();
    } catch (error) {
      console.error("OTP SAVE ERROR:", error);

      return Response.json(
        {
          success: false,
          message: `OTP save error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    // 7. SEND EMAIL
    try {
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

      if (emailResponse.error) {
        return Response.json(
          {
            success: false,
            message: `Email error: ${emailResponse.error.message}`,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("EMAIL SEND ERROR:", error);

      return Response.json(
        {
          success: false,
          message: `Email sending error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "OTP sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UNEXPECTED ERROR:", error);

    return Response.json(
      {
        success: false,
        message: `Unexpected server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}