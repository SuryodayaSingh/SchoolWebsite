import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

// ==========================================
// CHECK ADMIN
// ==========================================
async function checkAdmin() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user ||
    (session.user as any).role !== "admin"
  ) {
    return null;
  }

  return session;
}

// ==========================================
// GET SINGLE STUDENT
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdmin();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Not Authorized",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = await params;

    const student = await UserModel.findOne({
      _id: id,
      role: "student",
    }).select("-password -verifyCode -verifyCodeExpiry");

    if (!student) {
      return Response.json(
        {
          success: false,
          message: "Student Not Found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        student,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Student Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch student",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE STUDENT
// ==========================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdmin();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Not Authorized",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = await params;

    const body = await request.json();

    const {
      rollNumber,
      class: studentClass,
      grades,
      halfYearlyGrades,
      attendance,
    } = body;

    // पहले check करें कि student मौजूद है
    const student = await UserModel.findOne({
      _id: id,
      role: "student",
    });

    if (!student) {
      return Response.json(
        {
          success: false,
          message: "Student Not Found",
        },
        { status: 404 }
      );
    }

    // Student update
    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        rollNumber,
        class: studentClass,
        grades,
        halfYearlyGrades,
        attendance,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -verifyCode -verifyCodeExpiry");

    return Response.json(
      {
        success: true,
        message: "Student updated successfully",
        student: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Student Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update student",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE STUDENT
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ADMIN CHECK
    const session = await checkAdmin();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Not Authorized",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    // GET STUDENT ID
    const { id } = await params;

    // पहले check करें कि student मौजूद है
    const student = await UserModel.findOne({
      _id: id,
      role: "student",
    });

    if (!student) {
      return Response.json(
        {
          success: false,
          message: "Student Not Found",
        },
        { status: 404 }
      );
    }

    // DELETE STUDENT
    await UserModel.findByIdAndDelete(id);

    console.log("STUDENT DELETED:", id);

    return Response.json(
      {
        success: true,
        message: "छात्र सफलतापूर्वक हटा दिया गया",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Student Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete student",
      },
      { status: 500 }
    );
  }
}