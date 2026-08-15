import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  try {
    console.log("1. SIGNUP STARTED");

    await dbConnect();
    console.log("2. DATABASE CONNECTED");

    const { username, email, phone, password } = await request.json();

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();
    const normalizedPhone = phone?.trim();

    console.log("3. SIGNUP DATA:", {
      username: normalizedUsername,
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    if (
      !normalizedUsername ||
      !normalizedEmail ||
      !normalizedPhone ||
      !password
    ) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Check verified username
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username: normalizedUsername,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    // Check existing email
    const existingUserByEmail = await UserModel.findOne({
      email: normalizedEmail,
    });

    // Generate OTP
    const verifyCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      }

      console.log("4. UPDATING UNVERIFIED USER");

      const hashedPassword = await bcrypt.hash(password, 10);

      existingUserByEmail.username = normalizedUsername;
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.phone = normalizedPhone;
      existingUserByEmail.verifyCode = verifyCode;
      existingUserByEmail.verifyCodeExpiry = new Date(
        Date.now() + 60 * 60 * 1000
      );

      await existingUserByEmail.save();
    } else {
      console.log("4. CREATING NEW USER");

      const hashedPassword = await bcrypt.hash(password, 10);

      await UserModel.create({
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: new Date(
          Date.now() + 60 * 60 * 1000
        ),
        isVerified: false,
      });
    }

    console.log("5. USER SAVED, CALLING EMAIL FUNCTION");
    console.log("6. SENDING OTP TO:", normalizedEmail);

    const emailResponse = await sendVerificationEmail(
      normalizedEmail,
      normalizedPhone,
      normalizedUsername,
      verifyCode
    );

    console.log("7. EMAIL RESPONSE:", emailResponse);

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "User registered successfully. Please verify your email.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}