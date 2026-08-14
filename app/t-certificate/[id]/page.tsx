"use client";

import { useState, useEffect } from "react";
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
  grades?: Grade[];
}

export default function Transfercertificate() {
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/admin/student/${id}`);

        if (!response.ok) {
          throw new Error("छात्र की जानकारी प्राप्त नहीं हो सकी");
        }

        const data = await response.json();

        console.log("Student data:", data);

        setStudent(data.student || data);
      } catch (error) {
        console.error("छात्र की जानकारी प्राप्त करने में त्रुटि:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        स्थानांतरण प्रमाण पत्र लोड हो रहा है...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        छात्र नहीं मिला
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      {/* स्थानांतरण प्रमाण पत्र */}
      <div className="max-w-5xl mx-auto bg-white p-3 md:p-6 shadow-xl">
        <div className="border-[3px] border-black p-2">
          <div className="border border-black p-6 md:p-10 min-h-[1100px]">

            {/* स्कूल हेडर */}
            <div className="text-center border-b-2 border-black pb-6">
              <h1 className="text-3xl md:text-5xl font-bold tracking-wide">
                किसान इंटर कॉलेज
              </h1>

              <p className="text-lg md:text-xl font-semibold mt-2">
                गाजीपुर, उत्तर प्रदेश
              </p>

              <p className="text-sm mt-1">
                उत्तर प्रदेश माध्यमिक शिक्षा परिषद से संबद्ध
              </p>
            </div>

            {/* प्रमाण पत्र शीर्षक */}
            <div className="flex justify-center mt-10">
              <div className="border-2 border-black px-10 py-3">
                <h2 className="text-2xl md:text-3xl font-bold">
                  स्थानांतरण प्रमाण पत्र
                </h2>
              </div>
            </div>

            {/* प्रमाण पत्र संख्या */}
            <div className="flex justify-between mt-8 text-sm md:text-base">
              <p>
                <strong>टी.सी. संख्या:</strong> TC-{student._id.slice(-6)}
              </p>

              <p>
                <strong>दिनांक:</strong>{" "}
                {new Date().toLocaleDateString("hi-IN")}
              </p>
            </div>

            {/* मुख्य सामग्री */}
            <div className="mt-10 text-lg leading-10">
              <p>
                यह प्रमाणित किया जाता है कि <strong>{student.username}</strong>,
                अनुक्रमांक <strong>{student.rollNumber || "उपलब्ध नहीं"}</strong>,
                किसान इंटर कॉलेज, गाजीपुर का एक नियमित छात्र/छात्रा रहा/रही है।
              </p>

              <p className="mt-6">
                छात्र/छात्रा इस संस्थान में कक्षा{" "}
                <strong>{student.class || "उपलब्ध नहीं"}</strong> में अध्ययनरत
                था/थी।
              </p>

              <p className="mt-6">
                विद्यालय में उपलब्ध अभिलेखों के अनुसार, छात्र/छात्रा के अनुरोध पर
                यह स्थानांतरण प्रमाण पत्र प्रदान किया जा रहा है।
              </p>

              <p className="mt-6">
                इस संस्थान में अध्ययन अवधि के दौरान छात्र/छात्रा का आचरण एवं
                चरित्र:
              </p>

              <div className="mt-4 ml-8">
                <strong>आचरण: </strong>
                <span className="border-b border-black px-10">
                  उत्तम
                </span>
              </div>

              <p className="mt-10">
                हम छात्र/छात्रा के उज्ज्वल भविष्य एवं आगामी शैक्षणिक और
                व्यावसायिक जीवन के लिए हार्दिक शुभकामनाएं देते हैं।
              </p>
            </div>

            <div className="mt-28 flex justify-between items-end text-center px-4 md:px-10">
              <div>
                <div className="w-32 md:w-48 border-t-2 border-black mb-2"></div>
                <p className="font-semibold">कक्षा अध्यापक</p>
              </div>

              <div>
                <div className="w-32 md:w-48 border-t-2 border-black mb-2"></div>
                <p className="font-semibold">प्रधानाचार्य</p>
              </div>
            </div>

            <div className="mt-16 text-center text-sm border-t border-black pt-4">
              <p>
                यह कंप्यूटर द्वारा जनरेट किया गया स्थानांतरण प्रमाण पत्र है।
              </p>
              <p>किसान इंटर कॉलेज, गाजीपुर, उत्तर प्रदेश</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}