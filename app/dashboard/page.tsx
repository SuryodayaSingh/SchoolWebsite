"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header/page";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/app/asset/Logo.png"

interface Grade {
  subject: string;
  marks: number;
}

interface StudentData {
  _id?: string;
  username: string;
  email: string;
  phone: string;
  role?: string;
  isVerified?: boolean;
  rollNumber?: string;
  class?: string;
  grades?: Grade[];
  attendance?: {
    present: number;
    total: number;
  };
}

export default function DashboardPage() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await fetch("/api/user/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        console.log("Dashboard API:", data);

        if (!res.ok || !data.success) {
          if (res.status === 401) {
            router.push("/sign-in");
            return;
          }

          setError(data.message || "Failed to load user data");
          return;
        }

        if (!data.user) {
          setError("User data not found.");
          return;
        }

        setStudent(data.user);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Something went wrong while loading your data.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load dashboard
          </h1>

          <p className="text-red-500">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-[#574f87] text-white px-5 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        
        <p className="text-gray-600">
          No user data found.
        </p>
      </div>
    );
  }

  // =========================
  // ADMIN DASHBOARD
  // =========================

  if (student.role === "admin") {
    return ( 
      <div className="min-h-screen bg-purple-300 px-4 py-8">
        <div className="w-full p-2 mb-5">
         <Header />
         </div>
        <div className="max-w-5xl mx-auto">

          {/* WELCOME SECTION */}
          <div className="bg-gradient-to-r from-[#574f87] to-[#7c73b8] rounded-2xl shadow-lg p-8 md:p-12 text-white mb-6">
            <p className="text-sm font-medium opacity-80 mb-2">
              ADMIN DASHBOARD
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome, {student.username}! 👋
            </h1>

            <p className="mt-4 text-white/90 text-base md:text-lg max-w-2xl">
              Welcome to the school administration dashboard. From here,
              you can manage students, update academic records, attendance
              and other important student information.
            </p>
          </div>

          {/* ADMIN INFO */}
          <div className="bg-blue-200 rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Administrator Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="font-semibold text-gray-500">
                  Username
                </p>
                <p className="text-gray-900 mt-1 font-medium">
                  {student.username || "-"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-500">
                  Email
                </p>
                <p className="text-gray-900 mt-1 font-medium">
                  {student.email || "-"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-500">
                  Phone
                </p>
                <p className="text-gray-900 mt-1 font-medium">
                  {student.phone || "-"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-500">
                  Role
                </p>
                <p className="text-[#574f87] mt-1 font-bold capitalize">
                  {student.role}
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MANAGE STUDENTS */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Students
              </h2>

              <p className="text-sm text-gray-500 mt-3 mb-6">
                View student records, update student details, manage marks
                and attendance information.
              </p>

              <Link
                href="/admin/student"
                className="inline-block bg-[#574f87] text-white px-5 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Go to Student Management →
              </Link>
            </div>

            {/* ADMIN PANEL */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Quick Access
              </h2>

              <p className="text-sm text-gray-500 mt-3 mb-6">
                Access the administration panel to manage all student-related
                records and school data.
              </p>

              <Link
                href="/admin/student"
                className="inline-block border-2 border-[#574f87] text-[#574f87] px-5 py-3 rounded-lg font-semibold hover:bg-[#574f87] hover:text-white transition"
              >
                Open Admin Panel
              </Link>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================
  // STUDENT DASHBOARD
  // =========================

  const attendancePercent =
    student.attendance &&
    student.attendance.total > 0
      ? (
          (student.attendance.present /
            student.attendance.total) *
          100
        ).toFixed(1)
      : "N/A";

  return (
    <div className="min-h-screen bg-blue-200 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* PROFILE */}
        <div className="bg-purple-300 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Student Profile
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">

            <div>
              <p className="font-semibold text-gray-600">
                Username
              </p>
              <p className="text-gray-900 mt-1">
                {student.username || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">
                Email
              </p>
              <p className="text-gray-900 mt-1">
                {student.email || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">
                Phone
              </p>
              <p className="text-gray-900 mt-1">
                {student.phone || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">
                Roll No
              </p>
              <p className="text-gray-900 mt-1">
                {student.rollNumber || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">
                Class
              </p>
              <p className="text-gray-900 mt-1">
                {student.class || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">
                Role
              </p>
              <p className="text-gray-900 mt-1 capitalize">
                {student.role || "student"}
              </p>
            </div>

          </div>
        </div>

        {/* ATTENDANCE */}
        <div className="bg-purple-300 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Attendance
          </h2>

          {student.attendance ? (
            <>
              <p className="text-sm text-gray-700">
                {student.attendance.present} /{" "}
                {student.attendance.total} classes attended
              </p>

              <p className="text-2xl font-bold text-[#574f87] mt-2">
                {attendancePercent}%
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className="bg-[#574f87] h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      Number(attendancePercent) || 0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No attendance data yet.
            </p>
          )}
        </div>

        {/* GRADES */}
        <div className="bg-purple-300 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Grades
          </h2>

          {student.grades && student.grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3">
                      Subject
                    </th>

                    <th className="py-3">
                      Marks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {student.grades.map((grade, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0"
                    >
                      <td className="py-3">
                        {grade.subject}
                      </td>

                      <td className="py-3 font-semibold">
                        {grade.marks}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No grades recorded yet.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}