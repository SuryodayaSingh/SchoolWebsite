import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Principal from "@/app/asset/PrincipalImage.png";
import SchoolImage from "@/app/asset/SchoolImage.jpeg";
import Logo from "@/app/asset/Logo.png"
import {
  Card,
  CardDescription,
} from "@/components/ui/card";
import {
  GraduationCap,
  UserShield,
  BookOpen,
} from "lucide-react";
import Gallery from "./Gallery/page";

const features = [
  {
    icon: GraduationCap,
    title: "गुणवत्तापूर्ण शिक्षा",
    description: "शैक्षणिक उत्कृष्टता और व्यावहारिक शिक्षा पर विशेष ध्यान।",
  },
  {
    icon: UserShield,
    title: "अनुशासन और संस्कार",
    description: "मजबूत नैतिकता, अनुशासन और नेतृत्व क्षमता का विकास।",
  },
  {
    icon: BookOpen,
    title: "अनुभवी शिक्षक",
    description: "समर्पित और उच्च योग्य शिक्षकों से शिक्षा प्राप्त करें।",
  },
];

export default function Home() {
  return (
    <div>
      {/* Header */}
      <div className="border border-black p-5 text-2xl font-semibold flex justify-between bg-blue-100">
        <Image
        src={Logo}
        alt="Logo"
        className="p-1 mr-3"
         />

        <div className="flex">
          <Link href="/">
            <Button variant="link" className="font-semibold">
              होम
            </Button>
          </Link>

          <Link href="/AboutUs">
            <Button variant="link" className="font-semibold">
              हमारे बारे में
            </Button>
          </Link>
          <Link href="/Gallery"> 
        <Button variant="link" className="font-semibold"> 
         गैलरी
        </Button> 
          </Link>


          <Link href="tel:+9335342664">
            <Button variant="link" className="font-semibold">
              संपर्क करें
            </Button>
          </Link>

          <Link href="/sign-in">
            <Button variant="link" className="bg-indigo-400 font-bold">
              लॉगिन / साइन अप
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="border border-black p-5 bg-blue-200">
        <div className="flex">
          <div className="flex flex-col">
        <span className="flex flex-col">
          आपका स्वागत है
        </span>

        <span className="text-4xl font-bold text-blue-800 flex flex-col">
          किसान इंटर कॉलेज
        </span>

        <span className="flex flex-col">
          गाज़ीपुर, उत्तर प्रदेश
        </span>

        <div className="mt-4">
          गुणवत्तापूर्ण शिक्षा, चरित्र निर्माण और सर्वांगीण विकास के माध्यम से
          एक बेहतर भविष्य का निर्माण।
        </div>

        <div className="flex">
          <Link href="/AboutUs">
            <Button variant="outline" className="p-2 m-5">
              हमारे विद्यालय के बारे में
            </Button>
          </Link>

          <Link href="/Admissions">
            <Button variant="outline" className="p-2 m-5">
              प्रवेश प्रारंभ 2026-27
            </Button>
          </Link>
        </div>
        </div>
        <div className="flex">
          <Image
          src= {SchoolImage}
          alt="Image"
           />

        </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-blue-200">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <Card
              key={index}
              className="bg-purple-200 backdrop-blur-sm border-0 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="p-3 rounded-full bg-[#4B348F]/10">
                <Icon className="w-7 h-7 text-[#4B348F]" />
              </div>

              <span className="font-bold text-[#2B1D5A]">
                {feature.title}
              </span>

              <CardDescription>
                {feature.description}
              </CardDescription>
            </Card>
          );
        })}
      </div>

      {/* About and Principal Message */}
      <div className="grid grid-cols-1 md:grid-cols-2 mx-auto gap-5 p-4">
        <Card className="p-5 bg-purple-200 hover:shadow-lg shadow-black">
          <span className="font-bold text-2xl underline">
            हमारे बारे में
          </span>

          <span className="mt-3">
            किसान इंटर कॉलेज की स्थापना ग्रामीण युवाओं को गुणवत्तापूर्ण शिक्षा
            प्रदान करने के उद्देश्य से की गई है। हमारा लक्ष्य मजबूत संस्कारों,
            जिम्मेदारी की भावना और उत्कृष्ट शैक्षणिक आधार वाले नागरिकों का
            निर्माण करना है।
          </span>

          <Link href="/AboutUs">
            <Button className="bg-blue-600 w-30 mt-4">
              और पढ़ें...
            </Button>
          </Link>
        </Card>

        <Card className="p-5 bg-purple-200 hover:shadow-lg shadow-black">
          <div className="flex">
            <Image
            src= {Principal}
            alt="Principal pic"
            width={130}
            height={50} className="mr-3"
             />
             
             <div className="m-3">
          <span className="font-bold text-2xl underline flex flex-col">
            प्रधानाचार्य का संदेश
          </span>

          <span className="mt-3">
            हमारा उद्देश्य उच्च गुणवत्ता वाली शिक्षा प्रदान करना और विद्यार्थियों
            को आत्मविश्वासी, जिम्मेदार एवं जीवन में सफल व्यक्ति बनने के लिए
            प्रेरित करना है।
          </span>

          <h1 className="font-semibold text-yellow-600 mt-4">
            श्री मृत्युंजय कुमार पांडे
             ...प्रधानाचार्य
          </h1>
           </div>
           </div>
        </Card>
      </div>
      <Gallery />

      {/* Footer */}
      <div className="border border-black p-5 bg-blue-900 text-white flex flex-col md:flex-row justify-between gap-5">
        <div>
          <span className="flex flex-col">
            किसान इंटर कॉलेज

            <span className="text-yellow-400">
              गाज़ीपुर, उत्तर प्रदेश
            </span>

            <span className="flex flex-col mt-2">
              गुणवत्तापूर्ण शिक्षा, चरित्र निर्माण
            </span>

            <span className="flex flex-col">
              और सर्वांगीण विकास के लिए समर्पित
            </span>

            <span>
              एक उज्ज्वल भविष्य की ओर।
            </span>
          </span>
        </div>

        <div className="flex justify-between">
          <span className="flex flex-col mx-5">
            महत्वपूर्ण लिंक

            <Link href="/">
              <span className="hover:underline">
                होम
              </span>
            </Link>

            <Link href="/AboutUs">
              <span className="hover:underline">
                हमारे बारे में
              </span>
            </Link>

            <Link href="tel:+9335342664">
              <span className="hover:underline">
                संपर्क करें
              </span>
            </Link>

            <span className="hover:underline">
              सोमवार - शनिवार: सुबह 8:00 बजे - शाम 4:00 बजे
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}