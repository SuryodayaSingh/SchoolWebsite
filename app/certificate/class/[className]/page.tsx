"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  halfYearlyGrades?: Grade[];
  grades?: Grade[];
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

function normalizeClass(classValue?: string) {
  if (!classValue) return "";

  const value = classValue.trim().toUpperCase();

  const classMap: Record<string, string> = {
    "6": "VI",
    "7": "VII",
    "8": "VIII",
    "9": "IX",
    "10": "X",
    "11": "XI",
    "12": "XII",
    "CLASS 6": "VI",
    "CLASS 7": "VII",
    "CLASS 8": "VIII",
    "CLASS 9": "IX",
    "CLASS 10": "X",
    "CLASS 11": "XI",
    "CLASS 12": "XII",
    "CLASS VI": "VI",
    "CLASS VII": "VII",
    "CLASS VIII": "VIII",
    "CLASS IX": "IX",
    "CLASS X": "X",
    "CLASS XI": "XI",
    "CLASS XII": "XII",
  };

  return classMap[value] || value;
}

export default function ClassMarksheetPage() {
  const params = useParams();
  const router = useRouter();

  const rawClassName = Array.isArray(params.className)
    ? params.className[0]
    : params.className;

  const className = rawClassName
    ? decodeURIComponent(rawClassName)
    : "all";

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudentsWithLatestMarks() {
      try {
        setLoading(true);
        setError("");

        const listResponse = await fetch("/api/admin/student", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!listResponse.ok) {
          throw new Error("Failed to fetch students");
        }

        const listData = await listResponse.json();

        if (!listData.success) {
          throw new Error(
            listData.message || "Failed to fetch students"
          );
        }

        const allStudents: Student[] = listData.students || [];

        const classStudents =
          className.toLowerCase() === "all"
            ? allStudents
            : allStudents.filter(
                (student) =>
                  normalizeClass(student.class) ===
                  normalizeClass(className)
              );

        const completeStudents = await Promise.all(
          classStudents.map(async (student) => {
            try {
              const response = await fetch(
                `/api/admin/student/${student._id}`,
                {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                }
              );

              if (!response.ok) return student;

              const data = await response.json();

              if (data.success && data.student) {
                return data.student as Student;
              }

              return student;
            } catch (error) {
              console.error(
                `Student ${student._id} fetch error:`,
                error
              );
              return student;
            }
          })
        );

        setStudents(completeStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("छात्रों की जानकारी लोड नहीं हो सकी।");
      } finally {
        setLoading(false);
      }
    }

    fetchStudentsWithLatestMarks();
  }, [className]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-medium">
          सभी छात्रों की मार्कशीट लोड हो रही हैं...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
        <p className="text-red-500 font-semibold">{error}</p>

        <Button onClick={() => router.back()}>
          वापस जाएं
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 print:bg-white print:p-0">
      {/* TOP CONTROLS */}
      <div className="mx-auto mb-6 flex max-w-[1400px] flex-col gap-4 rounded-lg bg-white p-4 shadow-md sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold">
            {className.toLowerCase() === "all"
              ? "सभी छात्रों की मार्कशीट"
              : `कक्षा ${className} की सभी मार्कशीट`}
          </h1>

          <p className="text-sm text-gray-500">
            कुल छात्र: {students.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            वापस जाएं
          </Button>

          <button
            onClick={handlePrint}
            className="rounded-md bg-black px-8 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Print Marksheet
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-md print:hidden">
          कोई छात्र नहीं मिला।
        </div>
      ) : (
        students.map((student) => {
          const yearlyGrades = student.grades || [];
          const halfYearlyGrades =
            student.halfYearlyGrades || [];

          const subjects = Array.from(
            new Set([
              ...halfYearlyGrades.map((grade) =>
                grade.subject.trim()
              ),
              ...yearlyGrades.map((grade) =>
                grade.subject.trim()
              ),
            ])
          ).filter(Boolean);

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

          const halfYearlyTotal = halfYearlyGrades.reduce(
            (total, grade) =>
              total + Number(grade.marks || 0),
            0
          );

          const yearlyTotal = yearlyGrades.reduce(
            (total, grade) =>
              total + Number(grade.marks || 0),
            0
          );

          const totalMarks =
            halfYearlyTotal + yearlyTotal;

          const maximumMarks =
            subjects.length * 200;

          const percentage =
            maximumMarks > 0
              ? ((totalMarks / maximumMarks) * 100).toFixed(2)
              : "0.00";

          const result =
            subjects.length > 0 &&
            subjects.every((subject) => {
              const halfMarks = getMarks(
                halfYearlyGrades,
                subject
              );

              const yearlyMarks = getMarks(
                yearlyGrades,
                subject
              );

              return (
                halfMarks >= 33 &&
                yearlyMarks >= 33
              );
            })
              ? "उत्तीर्ण"
              : "अनुत्तीर्ण";

          const session = "2026-27";

          return (
            <div
              key={student._id}
              className="marksheet-page mx-auto mb-8 max-w-[1400px] bg-white p-2 shadow-lg print:max-w-none print:shadow-none"
            >
              <div className="relative h-full overflow-hidden border-2 border-black">
                {/* WATERMARK */}
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                  <div className="select-none whitespace-nowrap text-center text-7xl font-bold opacity-[0.08]">
                    किसान इंटर कॉलेज
                  </div>
                </div>

                {/* CONTENT */}
                <div className="relative z-10">
                  {/* HEADER */}
                  <div className="px-3 pt-3">
                    <div className="flex flex-col items-center justify-between gap-2">
                      <div>
                        <h1 className="text-4xl font-bold whitespace-nowrap">
                          किसान इंटर कॉलेज जवाहरनगर
                        </h1>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            जनपद कोड
                          </span>

                          <div className="flex">
                            {[1, 2].map((item) => (
                              <div
                                key={item}
                                className="h-8 w-9 border border-black"
                              />
                            ))}
                          </div>
                        </div>

                        <h2 className="mx-5 text-3xl font-bold">
                          अकादमिक सत्र {session}
                        </h2>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold whitespace-nowrap">
                            विद्यालय कोड
                          </span>

                          <div className="flex">
                            {[1, 2, 3, 4].map((item) => (
                              <div
                                key={item}
                                className="h-8 w-9 border border-black"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STUDENT DETAILS */}
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2">
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

                      <div className="grid grid-cols-5 gap-2">
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
                            "________________"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MARKS TABLE */}
                  <div className="mt-3 px-2">
                    <table className="w-full table-fixed border-collapse text-center text-[10px]">
                      <thead>
                        <tr>
                          <th
                            rowSpan={2}
                            className="border border-black p-1"
                          >
                            विषय
                          </th>

                          <th
                            colSpan={4}
                            className="border border-black p-1"
                          >
                            अर्द्धवार्षिक परीक्षा
                          </th>

                          <th
                            colSpan={5}
                            className="border border-black p-1"
                          >
                            वार्षिक परीक्षा
                          </th>

                          <th
                            colSpan={2}
                            className="border border-black p-1"
                          >
                            सम्पूर्ण योग
                          </th>

                          <th
                            rowSpan={2}
                            className="border border-black p-1"
                          >
                            परीक्षाफल / अन्य
                          </th>
                        </tr>

                        <tr>
                          <th className="border border-black p-1">
                            अर्द्धवार्षिक<br />मूल्यांकन
                          </th>
                          <th className="border border-black p-1">
                            प्रायोगिक<br />कार्य
                          </th>
                          <th className="border border-black p-1">
                            प्राप्तांक
                          </th>
                          <th className="border border-black p-1">
                            पूर्णांक
                          </th>
                          <th className="border border-black p-1">
                            वार्षिक<br />परीक्षा
                          </th>
                          <th className="border border-black p-1">
                            प्रायोगिक<br />परीक्षा
                          </th>
                          <th className="border border-black p-1">
                            प्राप्तांक
                          </th>
                          <th className="border border-black p-1">
                            योग
                          </th>
                          <th className="border border-black p-1">
                            ग्रेड
                          </th>
                          <th className="border border-black p-1">
                            प्राप्तांक
                          </th>
                          <th className="border border-black p-1">
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

                            const gradeValue =
                              getGradeValue(
                                completeMarks / 2
                              );

                            const subjectResult =
                              halfMarks >= 33 &&
                              yearlyMarks >= 33
                                ? "उत्तीर्ण"
                                : "अनुत्तीर्ण";

                            return (
                              <tr key={subject}>
                                <td className="border border-black px-2 py-1 text-left">
                                  {index + 1}. {subject}
                                </td>
                                <td className="border border-black p-1">-</td>
                                <td className="border border-black p-1">-</td>
                                <td className="border border-black p-1">
                                  {halfMarks}
                                </td>
                                <td className="border border-black p-1">
                                  100
                                </td>
                                <td className="border border-black p-1">
                                  {yearlyMarks}
                                </td>
                                <td className="border border-black p-1">-</td>
                                <td className="border border-black p-1">
                                  {yearlyMarks}
                                </td>
                                <td className="border border-black p-1">
                                  {yearlyMarks}
                                </td>
                                <td className="border border-black p-1 font-bold">
                                  {gradeValue}
                                </td>
                                <td className="border border-black p-1">
                                  {completeMarks}
                                </td>
                                <td className="border border-black p-1">
                                  200
                                </td>
                                <td className="border border-black p-1">
                                  {subjectResult}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={13}
                              className="border border-black p-3"
                            >
                              कोई अंक उपलब्ध नहीं है
                            </td>
                          </tr>
                        )}

                        {Array.from({
                          length: Math.max(0, 7 - subjects.length),
                        }).map((_, index) => (
                          <tr key={`empty-${index}`}>
                            <td className="border border-black py-1">
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

                        <tr className="font-bold">
                          <td
                            colSpan={9}
                            className="border border-black p-1 text-right"
                          >
                            योग
                          </td>

                          <td className="border border-black p-1">
                            {totalMarks}
                          </td>

                          <td className="border border-black p-1">
                            {maximumMarks}
                          </td>

                          <td className="border border-black p-1">
                            {percentage}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* RESULT DETAILS */}
                  <div className="grid grid-cols-3 border-t-0 border-black">
                    <div className="border-r border-black p-2">
                      <h3 className="mb-1 text-sm font-bold">
                        उपस्थिति
                      </h3>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between border-b border-dotted border-black">
                          <span>अर्द्धवार्षिक</span>
                          <span>________</span>
                        </div>

                        <div className="flex justify-between border-b border-dotted border-black">
                          <span>वार्षिक</span>
                          <span>________</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-r border-black p-2">
                      <h3 className="mb-1 text-sm font-bold">
                        परीक्षाफल
                      </h3>

                      <div className="space-y-0.5 text-xs">
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
                          {yearlyTotal} /{" "}
                          {yearlyGrades.length * 100}
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

                    <div className="p-2">
                      <h3 className="mb-1 text-sm font-bold">
                        कक्षा में स्थान
                      </h3>

                      <div className="text-lg font-bold">
                        __________
                      </div>
                    </div>
                  </div>

                  {/* SIGNATURES */}
                  <div className="grid grid-cols-3 border-t border-black">
                    <div className="h-14 border-r border-black p-2">
                      <div className="mt-6 text-center text-xs font-bold">
                        ह० कक्षाध्यापक/कक्षाध्यापिका
                      </div>
                    </div>

                    <div className="h-14 border-r border-black p-2">
                      <div className="mt-6 text-center text-xs font-bold">
                        हस्ताक्षर अभिभावक
                      </div>
                    </div>

                    <div className="h-14 p-2">
                      <div className="mt-6 text-center text-xs font-bold">
                        ह० प्रधानाचार्य/प्रधानाचार्या मुहर सहित
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html,
          body {
            width: 100%;
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .marksheet-page {
            width: 287mm !important;
            height: 200mm !important;
            max-width: 287mm !important;
            max-height: 200mm !important;

            margin: 0 auto !important;
            padding: 3mm !important;

            box-sizing: border-box !important;
            overflow: hidden !important;

            background: white !important;
            box-shadow: none !important;

            page-break-inside: avoid !important;
            break-inside: avoid !important;

            page-break-after: always !important;
            break-after: page !important;
          }

          .marksheet-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .marksheet-page > div {
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .marksheet-page .px-3 {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .marksheet-page .pt-3 {
            padding-top: 6px !important;
          }

          .marksheet-page .p-2 {
            padding: 3px !important;
          }

          .marksheet-page .mt-3 {
            margin-top: 4px !important;
          }

          .marksheet-page .mt-6 {
            margin-top: 10px !important;
          }

          .marksheet-page .mb-1 {
            margin-bottom: 2px !important;
          }

          .marksheet-page .text-4xl {
            font-size: 24px !important;
            line-height: 1.1 !important;
          }

          .marksheet-page .text-3xl {
            font-size: 19px !important;
            line-height: 1.1 !important;
          }

          .marksheet-page .text-lg {
            font-size: 14px !important;
          }

          .marksheet-page .text-sm {
            font-size: 11px !important;
          }

          .marksheet-page .text-xs {
            font-size: 9px !important;
          }

          .marksheet-page table {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            font-size: 8px !important;
          }

          .marksheet-page th,
          .marksheet-page td {
            padding: 2px !important;
            line-height: 1.05 !important;
            word-break: break-word !important;
          }

          .marksheet-page tbody tr {
            height: 18px !important;
          }

          .marksheet-page table,
          .marksheet-page tr,
          .marksheet-page td,
          .marksheet-page th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .marksheet-page .h-14 {
            height: 45px !important;
          }

          .marksheet-page .space-y-1 > * + * {
            margin-top: 2px !important;
          }

          .marksheet-page .space-y-0\\.5 > * + * {
            margin-top: 1px !important;
          }

          .marksheet-page .grid {
            gap: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}