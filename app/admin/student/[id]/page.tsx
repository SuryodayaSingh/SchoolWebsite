"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Grade {
  subject: string;
  marks: number;
}

interface Attendance {
  present: number;
  total: number;
}

interface StudentData {
  _id: string;
  username: string;
  rollNumber?: string;
  class?: string;
  grades?: Grade[];
  halfYearlyGrades?: Grade[];
  attendance?: Attendance;
}

// CLASS 6 TO 8
const DEFAULT_SUBJECTS_6_TO_8 = [
 "हिंदी",
  "अंग्रेज़ी",
  "गणित",
  "विज्ञान",
  "सामाजिक विज्ञान",
];

// CLASS 9 AND 10
const DEFAULT_SUBJECTS_9_TO_10 = [
  "हिंदी",
  "गणित",
  "विज्ञान",
  "सामाजिक विज्ञान",
];

// CLASS 11 AND 12
const DEFAULT_SUBJECTS_11_TO_12 = [
  "हिंदी",
  "अंग्रेज़ी",
  "गणित",
  "भौतिक विज्ञान",
  "रसायन विज्ञान",
];

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // CLASS KE ACCORDING DEFAULT SUBJECTS
  function getDefaultSubjects(studentClass?: string): string[] {
    if (!studentClass) {
      return DEFAULT_SUBJECTS_6_TO_8;
    }

    const normalizedClass = studentClass
      .toString()
      .trim()
      .toLowerCase()
      .replace("class", "")
      .replace("कक्षा", "")
      .trim();

    const classNumber = Number(
      normalizedClass.replace(/[^0-9]/g, "")
    );

    // CLASS 6 TO 8
    if (classNumber >= 6 && classNumber <= 8) {
      return DEFAULT_SUBJECTS_6_TO_8;
    }

    // CLASS 9 AND 10
    if (classNumber === 9 || classNumber === 10) {
      return DEFAULT_SUBJECTS_9_TO_10;
    }

    // CLASS 11 AND 12
    if (classNumber === 11 || classNumber === 12) {
      return DEFAULT_SUBJECTS_11_TO_12;
    }

    // OTHER CLASSES
    return DEFAULT_SUBJECTS_6_TO_8;
  }

  // DEFAULT SUBJECTS PREPARE
  function prepareDefaultSubjects(
    existingGrades: Grade[] = [],
    studentClass?: string
  ): Grade[] {
    const defaultSubjects = getDefaultSubjects(studentClass);

    return defaultSubjects.map((subject) => {
      const existingSubject = existingGrades.find(
        (grade) =>
          grade.subject.trim().toLowerCase() ===
          subject.trim().toLowerCase()
      );

      return {
        subject,
        marks: existingSubject?.marks ?? 0,
      };
    });
  }

  // STUDENT DATA FETCH
  useEffect(() => {
    if (!id) return;

    async function fetchStudent() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/admin/student/${id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "छात्र की जानकारी लोड नहीं हो सकी");
          return;
        }

        const existingYearlyGrades: Grade[] =
          data.student.grades || [];

        const existingHalfYearlyGrades: Grade[] =
          data.student.halfYearlyGrades || [];

        setStudent({
          ...data.student,

          grades: prepareDefaultSubjects(
            existingYearlyGrades,
            data.student.class
          ),

          halfYearlyGrades: prepareDefaultSubjects(
            existingHalfYearlyGrades,
            data.student.class
          ),

          attendance: data.student.attendance || {
            present: 0,
            total: 0,
          },
        });
      } catch (err) {
        console.error("छात्र लोड करने में त्रुटि:", err);
        setError("छात्र की जानकारी लोड करते समय कुछ गलत हो गया");
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [id]);

  function updateField<K extends keyof StudentData>(
    field: K,
    value: StudentData[K]
  ) {
    setStudent((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    );
  }

  // YEARLY MARKS UPDATE
  function updateYearlyGrade(
    index: number,
    field: keyof Grade,
    value: string
  ) {
    if (!student) return;

    const newGrades = [...(student.grades || [])];

    newGrades[index] = {
      ...newGrades[index],
      [field]:
        field === "marks"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    };

    updateField("grades", newGrades);
  }

  // HALF YEARLY MARKS UPDATE
  function updateHalfYearlyGrade(
    index: number,
    field: keyof Grade,
    value: string
  ) {
    if (!student) return;

    const newGrades = [...(student.halfYearlyGrades || [])];

    newGrades[index] = {
      ...newGrades[index],
      [field]:
        field === "marks"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    };

    updateField("halfYearlyGrades", newGrades);
  }

  function addYearlyGrade() {
    if (!student) return;

    updateField("grades", [
      ...(student.grades || []),
      {
        subject: "",
        marks: 0,
      },
    ]);
  }

  function addHalfYearlyGrade() {
    if (!student) return;

    updateField("halfYearlyGrades", [
      ...(student.halfYearlyGrades || []),
      {
        subject: "",
        marks: 0,
      },
    ]);
  }

  function removeYearlyGrade(index: number) {
    if (!student) return;

    updateField(
      "grades",
      (student.grades || []).filter((_, i) => i !== index)
    );
  }

  function removeHalfYearlyGrade(index: number) {
    if (!student) return;

    updateField(
      "halfYearlyGrades",
      (student.halfYearlyGrades || []).filter(
        (_, i) => i !== index
      )
    );
  }

  // SAVE STUDENT
  async function handleSave() {
    if (!student || !id) return;

    setSaving(true);
    setError("");

    try {
      const validYearlyGrades = (student.grades || []).filter(
        (grade) => grade.subject.trim() !== ""
      );

      const validHalfYearlyGrades = (
        student.halfYearlyGrades || []
      ).filter((grade) => grade.subject.trim() !== "");

      const res = await fetch(`/api/admin/student/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          rollNumber: student.rollNumber?.trim() || "",
          class: student.class?.trim() || "",

          grades: validYearlyGrades,
          halfYearlyGrades: validHalfYearlyGrades,

          attendance: {
            present: student.attendance?.present || 0,
            total: student.attendance?.total || 0,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "जानकारी सेव नहीं हो सकी");
        return;
      }

      router.push("/admin/student");
      router.refresh();
    } catch (err) {
      console.error("सेव करने में त्रुटि:", err);
      setError("जानकारी सेव करते समय कुछ गलत हो गया");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">
          छात्र की जानकारी लोड हो रही है...
        </p>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <p className="text-red-500">{error}</p>

          <button
            type="button"
            onClick={() => router.push("/admin/student")}
            className="mt-4 px-5 py-2 bg-[#574f87] text-white rounded-lg"
          >
            छात्रों की सूची पर वापस जाएं
          </button>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            छात्र की जानकारी संपादित करें
          </h1>

          <p className="text-gray-500 mt-1">
            {student.username}
          </p>
        </div>

        {/* ROLL NUMBER AND CLASS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              अनुक्रमांक
            </label>

            <input
              value={student.rollNumber || ""}
              onChange={(e) =>
                updateField("rollNumber", e.target.value)
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#574f87]"
              placeholder="अनुक्रमांक दर्ज करें"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              कक्षा
            </label>

            <input
              value={student.class || ""}
              onChange={(e) =>
                updateField("class", e.target.value)
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#574f87]"
              placeholder="कक्षा दर्ज करें"
            />
          </div>
        </div>

        {/* ATTENDANCE */}
        <div>
          <label className="text-sm font-semibold text-gray-700">
            उपस्थिति
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                उपस्थित दिन
              </p>

              <input
                type="number"
                min="0"
                value={student.attendance?.present ?? 0}
                onChange={(e) =>
                  updateField("attendance", {
                    present: Number(e.target.value),
                    total: student.attendance?.total ?? 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#574f87]"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                कुल दिन
              </p>

              <input
                type="number"
                min="0"
                value={student.attendance?.total ?? 0}
                onChange={(e) =>
                  updateField("attendance", {
                    present: student.attendance?.present ?? 0,
                    total: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#574f87]"
              />
            </div>
          </div>
        </div>

        {/* YEARLY EXAMINATION MARKS */}
        <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#574f87]">
              वार्षिक परीक्षा के अंक
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Yearly Examination Marks
            </p>
          </div>

          <div className="space-y-3">
            {(student.grades || []).map((grade, index) => (
              <div
                key={`yearly-${index}`}
                className="flex gap-2 items-center"
              >
                <input
                  placeholder="विषय"
                  value={grade.subject}
                  onChange={(e) =>
                    updateYearlyGrade(
                      index,
                      "subject",
                      e.target.value
                    )
                  }
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#574f87]"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="अंक"
                  value={grade.marks}
                  onChange={(e) =>
                    updateYearlyGrade(
                      index,
                      "marks",
                      e.target.value
                    )
                  }
                  className="w-28 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#574f87]"
                />

                <button
                  type="button"
                  onClick={() => removeYearlyGrade(index)}
                  className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                  title="विषय हटाएं"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addYearlyGrade}
            className="mt-4 px-4 py-2 text-sm font-semibold text-[#574f87] border border-[#574f87] rounded-lg hover:bg-[#574f87] hover:text-white transition"
          >
            + विषय जोड़ें
          </button>
        </div>

        {/* HALF YEARLY EXAMINATION MARKS */}
        <div className="border border-green-200 rounded-xl p-4 bg-green-50/30">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-green-700">
              अर्धवार्षिक परीक्षा के अंक
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Half Yearly Examination Marks
            </p>
          </div>

          <div className="space-y-3">
            {(student.halfYearlyGrades || []).map(
              (grade, index) => (
                <div
                  key={`half-yearly-${index}`}
                  className="flex gap-2 items-center"
                >
                  <input
                    placeholder="विषय"
                    value={grade.subject}
                    onChange={(e) =>
                      updateHalfYearlyGrade(
                        index,
                        "subject",
                        e.target.value
                      )
                    }
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="अंक"
                    value={grade.marks}
                    onChange={(e) =>
                      updateHalfYearlyGrade(
                        index,
                        "marks",
                        e.target.value
                      )
                    }
                    className="w-28 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeHalfYearlyGrade(index)
                    }
                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                    title="विषय हटाएं"
                  >
                    ✕
                  </button>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={addHalfYearlyGrade}
            className="mt-4 px-4 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
          >
            + विषय जोड़ें
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/admin/student")}
            disabled={saving}
            className="sm:w-1/3 h-12 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="sm:w-full h-12 bg-[#574f87] hover:bg-[#463f70] disabled:opacity-60 text-white rounded-lg font-semibold transition"
          >
            {saving
              ? "जानकारी सेव हो रही है..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}