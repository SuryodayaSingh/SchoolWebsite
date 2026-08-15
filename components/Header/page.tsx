"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/asset/Logo.png";

function Header() {
  return (
    <div>
      {/* Header */}
      <div className="border border-black p-3 sm:p-5 text-lg sm:text-2xl font-semibold flex flex-wrap sm:justify-between items-center gap-3 bg-blue-100 w-full">
        
        <Image
          src={Logo}
          alt="Logo"
          className="p-1 mr-3"
        />

        <div className="flex items-center gap-2">
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

        <Button
  variant="link"
  onClick={() => signOut({ callbackUrl: "/sign-in" })}
  className="bg-indigo-400 font-bold text-white px-1.5"
>
  
  लॉग आउट
</Button>
        </div>
      </div>
    </div>
  );
}

export default Header;