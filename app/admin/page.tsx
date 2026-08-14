import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Link from "next/link";
import Header from "@/components/Header/page";
import {
  Users,
  GraduationCap,
  FileText,
  Award,
  ArrowRight,
} from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/sign-in");
  }

  const adminName = session.user.name || session.user.email || "Admin";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="w-full">
        <Header />
      </div>

      {/* Main Dashboard */}
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8 rounded-2xl bg-[#574f87] p-6 text-white shadow-lg md:p-8">
            <h1 className="text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-purple-100">
              Welcome back, {adminName}
            </p>

            <p className="mt-1 text-sm text-purple-200">
              Manage students, marksheets, certificates and academic records
              from one place.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Manage Students */}
            <Link
              href="/admin/student"
              className="group rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-[#574f87]">
                  <Users size={28} />
                </div>

                <ArrowRight
                  size={22}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#574f87]"
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">
                Manage Students
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                View, add, edit and manage all registered students.
              </p>

              <div className="mt-5 font-semibold text-[#574f87]">
                Manage Students →
              </div>
            </Link>

            {/* Manage Marksheets */}
            <Link
              href="/admin/student"
              className="group rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileText size={28} />
                </div>

                <ArrowRight
                  size={22}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">
                Marksheets
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Update subjects, marks and generate student marksheets.
              </p>

              <div className="mt-5 font-semibold text-blue-600">
                Manage Marksheets →
              </div>
            </Link>
          </div>

          {/* Quick Information */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <GraduationCap size={26} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  School Management System
                </h2>

                <p className="text-sm text-gray-500">
                  Use the dashboard to manage all student academic information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}