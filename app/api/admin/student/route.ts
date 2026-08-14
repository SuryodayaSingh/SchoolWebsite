import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("ADMIN SESSION:", session);

    if (
      !session ||
      !session.user ||
      (session.user as any).role !== "admin"
    ) {
      return Response.json(
        {
          success: false,
          message: "Not Authorized",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    // IMPORTANT DEBUG
    const allUsers = await UserModel.find({})
      .select("username email phone role rollNumber class")
      .lean();

    console.log("========== ALL USERS ==========");
    console.log(allUsers);
    console.log("TOTAL USERS:", allUsers.length);

    const students = await UserModel.find({
      role: "student",
    })
      .select("username email phone role rollNumber class")
      .lean();

    console.log("========== STUDENTS ==========");
    console.log(students);
    console.log("TOTAL STUDENTS:", students.length);

    return Response.json(
      {
        success: true,
        students,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN STUDENT API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load students",
      },
      { status: 500 }
    );
  }
}