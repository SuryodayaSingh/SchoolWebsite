"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header/page";

interface StudentSummary {
  _id: string;
  username: string;
  email: string;
  phone: string;
  rollNumber?: string;
  class?: string;
}

const classOptions = [
  { value: "all", label: "सभी कक्षाएं" },
  { value: "VI", label: "कक्षा VI" },
  { value: "VII", label: "कक्षा VII" },
  { value: "VIII", label: "कक्षा VIII" },
  { value: "IX", label: "कक्षा IX" },
  { value: "X", label: "कक्षा X" },
  { value: "XI", label: "कक्षा XI" },
  { value: "XII", label: "कक्षा XII" },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // DELETE LOADING STATE
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  // Roman aur Numeric dono class formats support karega
  const normalizeClass = (classValue?: string) => {
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

      "VI": "VI",
      "VII": "VII",
      "VIII": "VIII",
      "IX": "IX",
      "X": "X",
      "XI": "XI",
      "XII": "XII",
    };

    return classMap[value] || value;
  };

  // STUDENTS FETCH
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/student", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        console.log("ADMIN STUDENTS API:", data);

        if (!res.ok || !data.success) {
          setError(
            data.message || "छात्रों की जानकारी लोड नहीं हो सकी।"
          );
          return;
        }

        setStudents(data.students || []);
      } catch (err) {
        console.error("FETCH STUDENTS ERROR:", err);

        setError(
          "छात्रों की जानकारी लोड करते समय कुछ गलत हो गया।"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  // Selected class ke according students filter
  const filteredStudents =
    selectedClass === "all"
      ? students
      : students.filter(
          (student) =>
            normalizeClass(student.class) === selectedClass
        );

  // पूरी class ke certificates page par jane ke liye
  const handleClassCertificate = () => {
    if (selectedClass === "all") {
      alert(
        "कृपया पहले ड्रॉपडाउन से कोई एक कक्षा चुनें।"
      );
      return;
    }

    if (filteredStudents.length === 0) {
      alert("इस कक्षा में कोई छात्र नहीं मिला।");
      return;
    }

    router.push(
      `/certificate/class/${encodeURIComponent(selectedClass)}`
    );
  };

  // ========================================
  // DELETE STUDENT
  // ========================================
  const handleDeleteStudent = async (
    studentId: string,
    studentName: string
  ) => {
    const confirmDelete = window.confirm(
      `क्या आप "${studentName}" को हटाना चाहते हैं?\n\nयह कार्रवाई वापस नहीं की जा सकती।`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(studentId);
      setError("");

      const res = await fetch(
        `/api/admin/student/${studentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message || "छात्र को हटाया नहीं जा सका।"
        );
        return;
      }

      // बिना page refresh किए student list update होगी
      setStudents((prevStudents) =>
        prevStudents.filter(
          (student) => student._id !== studentId
        )
      );

      alert("छात्र सफलतापूर्वक हटा दिया गया।");
    } catch (err) {
      console.error("DELETE STUDENT ERROR:", err);

      alert(
        "छात्र को हटाते समय कुछ गलत हो गया।"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="m-2 w-full">
          <Header />
        </div>

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-lg font-medium">
            छात्रों की जानकारी लोड हो रही है...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="m-2 w-full">
          <Header />
        </div>

        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-red-500 font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#574f87] text-white rounded-lg hover:opacity-90 transition"
            >
              पुनः प्रयास करें
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="m-2 w-full">
        <Header />
      </div>

      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-200 rounded-2xl shadow-lg p-6">

            {/* HEADER SECTION */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  सभी छात्र
                </h1>

                <p className="text-sm text-gray-600 mt-1">
                  कुल छात्र: {filteredStudents.length}
                </p>
              </div>

              {/* BUTTONS AND FILTER */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-5">

                {/* CLASS FILTER */}
                <select
                  value={selectedClass}
                  onChange={(e) =>
                    setSelectedClass(e.target.value)
                  }
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-purple-400 text-black font-semibold outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {classOptions.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                {/* CLASS CERTIFICATE BUTTON */}
                <button
                  type="button"
                  onClick={handleClassCertificate}
                  disabled={selectedClass === "all"}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition ${
                    selectedClass === "all"
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-purple-400 text-black hover:bg-purple-500"
                  }`}
                >
                  पूरी कक्षा के प्रमाण पत्र
                </button>

                {/* DASHBOARD BUTTON */}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-3 bg-purple-400 text-black rounded-lg text-sm font-semibold hover:bg-purple-500 transition"
                >
                  डैशबोर्ड पर वापस जाएं
                </button>
              </div>
            </div>

            {/* SELECTED CLASS INFO */}
            {selectedClass !== "all" && (
              <div className="mb-5 bg-white rounded-lg px-4 py-3 shadow-sm">
                <p className="font-semibold text-gray-800">
                  चुनी गई कक्षा: कक्षा {selectedClass}
                </p>

                <p className="text-sm text-gray-600">
                  इस कक्षा में कुल छात्र: {filteredStudents.length}
                </p>
              </div>
            )}

            {/* EMPTY STATE */}
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-xl">
                <p className="text-gray-500 text-center py-10">
                  इस कक्षा में कोई छात्र नहीं मिला।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left bg-gray-50">
                      <th className="py-4 px-3">
                        छात्र का नाम
                      </th>

                      <th className="py-4 px-3">
                        कक्षा
                      </th>

                      <th className="py-4 px-3">
                        अनुक्रमांक
                      </th>

                      <th className="py-4 px-3">
                        प्रमाण पत्र
                      </th>

                      <th className="py-4 px-3">
                        टी.सी.
                      </th>

                      <th className="py-4 px-3">
                        कार्य
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b last:border-0 bg-white hover:bg-gray-50 transition"
                      >
                        {/* STUDENT NAME */}
                        <td className="py-4 px-3 font-bold whitespace-nowrap">
                          {s.username}
                        </td>

                        {/* CLASS */}
                        <td className="py-4 px-3">
                          {s.class || "-"}
                        </td>

                        {/* ROLL NUMBER */}
                        <td className="py-4 px-3">
                          {s.rollNumber || "-"}
                        </td>

                        {/* INDIVIDUAL CERTIFICATE */}
                        <td className="py-4 px-3">
                          <Link
                            href={`/certificate/${s._id}`}
                          >
                            <Button
                              variant="outline"
                              className="bg-[#574f87] hover:bg-[#463d70] text-white border-none whitespace-nowrap"
                            >
                              प्रमाण पत्र
                            </Button>
                          </Link>
                        </td>

                        {/* TRANSFER CERTIFICATE */}
                        <td className="py-4 px-3">
                          <Link
                            href={`/t-certificate/${s._id}`}
                          >
                            <Button
                              variant="outline"
                              className="bg-[#574f87] hover:bg-[#463d70] text-white border-none whitespace-nowrap"
                            >
                              स्थानांतरण प्रमाण पत्र
                            </Button>
                          </Link>
                        </td>

                        {/* EDIT + DELETE */}
                        <td className="py-4 px-3">
                          <div className="flex flex-col sm:flex-row gap-2">

                            {/* EDIT BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                router.push(
                                  `/admin/student/${s._id}`
                                );
                              }}
                              disabled={
                                deletingId === s._id
                              }
                              className="px-4 py-2 bg-[#574f87] text-white rounded-lg hover:bg-[#463d70] transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              संपादित करें
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteStudent(
                                  s._id,
                                  s.username
                                )
                              }
                              disabled={
                                deletingId === s._id
                              }
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === s._id
                                ? "हटाया जा रहा है..."
                                : "हटाएं"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}