import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET() {
  try {
    // Get logged-in user session
    const session = await getServerSession(authOptions);

    console.log("ME API SESSION:", session);

    if (!session?.user?._id) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        {
          status: 401,
        }
      );
    }

    // TEST USER
    if (session.user._id === "test-admin") {
      console.log("TEST ADMIN DETECTED");

      return Response.json(
        {
          success: true,
          user: {
            _id: "test-admin",
            username: "TestAdmin",
            email: "test@example.com",
            phone: "7474747474",
            role: "admin",
            isVerified: true,
            rollNumber: "TEST001",
            class: "B.Tech IT",

            grades: [
              {
                subject: "Data Structures",
                marks: 85,
              },
              {
                subject: "DBMS",
                marks: 90,
              },
              {
                subject: "Web Development",
                marks: 88,
              },
            ],

            halfYearlyGrades: [],

            attendance: {
              present: 42,
              total: 50,
            },
          },
        },
        {
          status: 200,
        }
      );
    }

    // REAL USER
    await dbConnect();

    const user = await UserModel.findById(session.user._id)
      .select(
        "-password -verifyCode -verifyCodeExpiry -loginOtpVerified"
      )
      .lean();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("ME API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}