"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Grade {
  subject: string;
  marks: number;
}

interface Student {
  _id: string;
  username: string;
  email: string;
  phone: string;
  rollNumber?: string;
  class?: string;

  // Half Yearly Examination
  halfYearlyGrades?: Grade[];

  // Yearly / Annual Examination
  grades?: Grade[];

  // Optional fields
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  registrationNumber?: string;
}

function getGradeValue(marks: number) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B+";
  if (marks >= 60) return "B";
  if (marks >= 50) return "C";
  if (marks >= 33) return "D";
  return "F";
}

export default function Marksheet() {
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const response = await fetch(`/api/admin/student/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch student");
        }

        setStudent(data.student);
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Student not found
      </div>
    );
  }

  // ==========================================
  // SUBJECTS FROM BOTH EXAMS
  // ==========================================

  const yearlyGrades = student.grades || [];
  const halfYearlyGrades = student.halfYearlyGrades || [];

  // Dono exams ke subjects ko combine karenge
  const subjects = Array.from(
    new Set([
      ...halfYearlyGrades.map((grade) => grade.subject.trim()),
      ...yearlyGrades.map((grade) => grade.subject.trim()),
    ])
  ).filter(Boolean);

  // ==========================================
  // HELPER: SUBJECT KE MARKS FIND KARNA
  // ==========================================

  function getMarks(
    grades: Grade[],
    subject: string
  ) {
    const found = grades.find(
      (grade) =>
        grade.subject.trim().toLowerCase() ===
        subject.trim().toLowerCase()
    );

    return found ? Number(found.marks) : 0;
  }

  // ==========================================
  // TOTAL MARKS
  // ==========================================

  const halfYearlyTotal = halfYearlyGrades.reduce(
    (total, grade) => total + Number(grade.marks || 0),
    0
  );

  const yearlyTotal = yearlyGrades.reduce(
    (total, grade) => total + Number(grade.marks || 0),
    0
  );

  // Complete Total = Half Yearly + Yearly
  const totalMarks = halfYearlyTotal + yearlyTotal;

  // Har subject me Half Yearly 100 + Yearly 100
  const maximumMarks = subjects.length * 200;

  const percentage =
    maximumMarks > 0
      ? ((totalMarks / maximumMarks) * 100).toFixed(2)
      : "0.00";

  // ==========================================
  // RESULT
  // ==========================================

  const result =
    subjects.length > 0 &&
    subjects.every((subject) => {
      const halfMarks = getMarks(halfYearlyGrades, subject);
      const yearlyMarks = getMarks(yearlyGrades, subject);

      // Dono exams me minimum 33 marks
      return halfMarks >= 33 && yearlyMarks >= 33;
    })
      ? "उत्तीर्ण"
      : "अनुत्तीर्ण";

  const session = "2026-27";

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-[1400px] bg-white p-3 shadow-lg print:max-w-none print:shadow-none">

        {/* Main Marksheet Border */}
        <div className="border-2 border-black">

          {/* ================= HEADER ================= */}

          <div className="px-3 pt-3">

            {/* Top School Information */}
            <div className="flex flex-col items-center justify-between gap-3">

              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl font-bold whitespace-nowrap">
                  किसान इंटर कॉलेज जवाहरनगर
                </span>
              </div>

              <div className="flex">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    जनपद कोड
                  </span>

                  <div className="flex">
                    {[1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-9 w-10 border border-black"
                      />
                    ))}
                  </div>
                </div>

                <div className="hidden md:block text-center">
                  <h1 className="text-3xl font-bold mx-5">
                    अकादमिक सत्र {session}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap mx-5">
                    विद्यालय कोड
                  </span>

                  <div className="flex">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-9 w-10 border border-black"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Session */}
            <div className="mt-3 text-center md:hidden">
              <h1 className="text-2xl font-bold">
                अकादमिक सत्र {session}
              </h1>
            </div>

            {/* ================= STUDENT DETAILS ================= */}

            <div className="mt-4 space-y-2 text-base sm:text-lg">

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    छात्र / छात्रा का नाम:{" "}
                  </span>
                  {student.username}
                </div>

                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    पिता का नाम:{" "}
                  </span>
                  {student.fatherName || "________________"}
                </div>

                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    माता का नाम:{" "}
                  </span>
                  {student.motherName || "________________"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    कक्षा एवं वर्ग:{" "}
                  </span>
                  {student.class || "N/A"}
                </div>

                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    अनुक्रमांक:{" "}
                  </span>
                  {student.rollNumber || "N/A"}
                </div>

                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    जन्मतिथि:{" "}
                  </span>
                  {student.dateOfBirth || "____________"}
                </div>

                <div className="border-b border-dotted border-black">
                  <span className="font-bold">
                    छात्र पं० सं०:{" "}
                  </span>
                  {student._id.slice(-6).toUpperCase()}
                  </div>

<div className="border-b border-dotted border-black">
                <span className="font-bold">
                  रजिस्ट्रेशन नं०:{" "}
                </span>
                {student.registrationNumber ||
                  "________________________"}
              </div>
            </div>
                </div>
              
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-center text-sm">
              
              <thead>

                <tr>
                  <th
                    rowSpan={2}
                    className="border border-black p-2 text-base"
                  >
                    विषय
                  </th>

                  <th
                    colSpan={4}
                    className="border border-black p-2 text-base"
                  >
                    अर्द्धवार्षिक परीक्षा
                  </th>

                  <th
                    colSpan={5}
                    className="border border-black p-2 text-base"
                  >
                    वार्षिक परीक्षा
                  </th>

                  <th
                    colSpan={2}
                    className="border border-black p-2 text-base"
                  >
                    सम्पूर्ण योग
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-black p-2 text-base"
                  >
                    परीक्षाफल / अन्य
                  </th>
                </tr>

                <tr>
                  <th className="border border-black p-2">
                    अर्द्धवार्षिक
                    <br />
                    मूल्यांकन
                  </th>

                  <th className="border border-black p-2">
                    प्रायोगिक
                    <br />
                    कार्य
                  </th>

                  <th className="border border-black p-2">
                    प्राप्तांक
                  </th>

                  <th className="border border-black p-2">
                    पूर्णांक
                  </th>

                  <th className="border border-black p-2">
                    वार्षिक
                    <br />
                    परीक्षा
                  </th>

                  <th className="border border-black p-2">
                    प्रायोगिक
                    <br />
                    परीक्षा
                  </th>

                  <th className="border border-black p-2">
                    प्राप्तांक
                  </th>

                  <th className="border border-black p-2">
                    योग
                  </th>

                  <th className="border border-black p-2">
                    ग्रेड
                  </th>

                  <th className="border border-black p-2">
                    प्राप्तांक
                  </th>

                  <th className="border border-black p-2">
                    पूर्णांक
                  </th>
                </tr>
              </thead>

              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((subject, index) => {
                    const halfMarks = getMarks(
                      halfYearlyGrades,
                      subject
                    );

                    const yearlyMarks = getMarks(
                      yearlyGrades,
                      subject
                    );

                    const completeMarks =
                      halfMarks + yearlyMarks;

                    const completeMaximum = 200;

                    const gradeValue = getGradeValue(
                      completeMarks / 2
                    );

                    const subjectResult =
                      halfMarks >= 33 &&
                      yearlyMarks >= 33
                        ? "उत्तीर्ण"
                        : "अनुत्तीर्ण";

                    return (
                      <tr key={subject}>
                        {/* Subject */}
                        <td className="border border-black px-3 py-3 text-left font-medium">
                          {index + 1}. {subject}
                        </td>

                        {/* ================= HALF YEARLY ================= */}

                        {/* Periodic Assessment */}
                        <td className="border border-black p-2">
                          -
                        </td>

                        {/* Practical Work */}
                        <td className="border border-black p-2">
                          -
                        </td>

                        {/* Half Yearly Obtained Marks */}
                        <td className="border border-black p-2 font-medium">
                          {halfMarks}
                        </td>

                        {/* Half Yearly Maximum Marks */}
                        <td className="border border-black p-2">
                          100
                        </td>

                        {/* ================= YEARLY ================= */}

                        {/* Annual Examination */}
                        <td className="border border-black p-2 font-medium">
                          {yearlyMarks}
                        </td>

                        {/* Practical Examination */}
                        <td className="border border-black p-2">
                          -
                        </td>

                        {/* Obtained Marks */}
                        <td className="border border-black p-2">
                          {yearlyMarks}
                        </td>

                        {/* Total */}
                        <td className="border border-black p-2">
                          {yearlyMarks}
                        </td>

                        {/* Grade */}
                        <td className="border border-black p-2 font-bold">
                          {gradeValue}
                        </td>

                        {/* ================= COMPLETE TOTAL ================= */}

                        {/* Obtained */}
                        <td className="border border-black p-2 font-medium">
                          {completeMarks}
                        </td>

                        {/* Maximum */}
                        <td className="border border-black p-2">
                          {completeMaximum}
                        </td>

                        {/* Result */}
                        <td className="border border-black p-2">
                          {subjectResult}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={13}
                      className="border border-black p-5"
                    >
                      कोई अंक उपलब्ध नहीं है
                    </td>
                  </tr>
                )}

                {/* Empty rows */}
                {Array.from({
                  length: Math.max(0, 7 - subjects.length),
                }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-black py-3">
                      {subjects.length + index + 1}.
                    </td>

                    {Array.from({ length: 12 }).map(
                      (_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-black"
                        />
                      )
                    )}
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="font-bold">
                  <td
                    colSpan={9}
                    className="border border-black p-3 text-right text-lg"
                  >
                    योग
                  </td>

                  <td className="border border-black p-3 text-lg">
                    {totalMarks}
                  </td>

                  <td className="border border-black p-3 text-lg">
                    {maximumMarks}
                  </td>

                  <td className="border border-black p-3">
                    {percentage}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ================= RESULT DETAILS ================= */}

          <div className="grid grid-cols-1 border-t-0 border-black md:grid-cols-3">

            {/* Attendance */}
            <div className="border-r border-black p-4">
              <h3 className="mb-3 text-lg font-bold">
                उपस्थिति
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-dotted border-black pb-1">
                  <span>अर्द्धवार्षिक</span>
                  <span>________</span>
                </div>

                <div className="flex justify-between border-b border-dotted border-black pb-1">
                  <span>वार्षिक</span>
                  <span>________</span>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="border-r border-black p-4">
              <h3 className="mb-3 text-lg font-bold">
                परीक्षाफल
              </h3>

              <div className="space-y-2">
                <p>
                  <span className="font-bold">
                    अर्द्धवार्षिक कुल प्राप्तांक:{" "}
                  </span>
                  {halfYearlyTotal} /{" "}
                  {halfYearlyGrades.length * 100}
                </p>

                <p>
                  <span className="font-bold">
                    वार्षिक कुल प्राप्तांक:{" "}
                  </span>
                  {yearlyTotal} / {yearlyGrades.length * 100}
                </p>

                <p>
                  <span className="font-bold">
                    सम्पूर्ण प्राप्तांक:{" "}
                  </span>
                  {totalMarks} / {maximumMarks}
                </p>

                <p>
                  <span className="font-bold">
                    प्रतिशत:{" "}
                  </span>
                  {percentage}%
                </p>

                <p>
                  <span className="font-bold">
                    परिणाम:{" "}
                  </span>
                  {result}
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="p-4">
              <h3 className="mb-3 text-lg font-bold">
                कक्षा में स्थान
              </h3>

              <div className="text-2xl font-bold">
                __________
              </div>
            </div>
          </div>

          {/* ================= SIGNATURES ================= */}

          <div className="grid grid-cols-3 border-t border-black">
            <div className="min-h-24 border-b border-black p-3 md:border-b-0 md:border-r">
              <div className="mt-12 text-center font-bold">
                ह० कक्षाध्यापक/कक्षाध्यापिका
              </div>
            </div>

            <div className="min-h-24 border-b border-black p-3 md:border-b-0 md:border-r">
              <div className="mt-12 text-center font-bold">
                हस्ताक्षर अभिभावक
              </div>
            </div>

            <div className="min-h-24 p-3">
              <div className="mt-12 text-center font-bold">
                ह० प्रधानाचार्य/प्रधानाचार्या मुहर सहित
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="rounded-md bg-black px-8 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Print Marksheet
          </button>
        </div>
      </div>
    </div>
  );
}