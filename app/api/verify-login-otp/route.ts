import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const { identifier, otp } = body;

    // Validate identifier
    if (
      !identifier ||
      typeof identifier !== "string" ||
      !identifier.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Identifier is required",
        },
        { status: 400 }
      );
    }

    // Validate OTP
    if (
      !otp ||
      typeof otp !== "string" ||
      !otp.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "OTP is required",
        },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Find user using phone, email, or username
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

    // Check if OTP exists
    if (!user.verifyCode) {
      return Response.json(
        {
          success: false,
          message: "No login OTP found. Please login again.",
        },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (
      !user.verifyCodeExpiry ||
      new Date(user.verifyCodeExpiry) < new Date()
    ) {
      return Response.json(
        {
          success: false,
          message: "OTP has expired. Please login again.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.verifyCode !== otp.trim()) {
      return Response.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // Mark login OTP as verified
    user.loginOtpVerified = true;

    // Remove OTP after successful verification
    // user.verifyCode = "";
    user.verifyCodeExpiry = new Date(Date.now()+3600000);

    await user.save();

    return Response.json(
      {
        success: true,
        message: "OTP verified successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY LOGIN OTP ERROR:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify OTP",
      },
      { status: 500 }
    );
  }
}