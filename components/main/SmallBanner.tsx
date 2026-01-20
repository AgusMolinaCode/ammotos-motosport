import Link from "next/link";
import React from "react";
import { Instagram, Facebook } from "lucide-react";
import { WhatsApp } from "@/public/whatssapp";

const SmallBanner = () => {
  return (
    <div className="h-10 bg-blue-900/70 flex justify-between px-2 md:justify-around items-center">
      {/* <div className="hidden md:block">
        <p className="text-center text-white font-medium py-2">
          Soporte 24/7:{" "}
          <Link href="mailto:am.motos@hotmail.com" className="underline">
            am.motos@hotmail.com
          </Link>
        </p>
      </div> */}
      <div className=" gap-2 items-center">
        <Link
          href="https://wa.me/5491150494936"
          target="_blank"
          aria-label="WhatsApp"
          className="flex items-center gap-2"
        >
          <WhatsApp className="w-6 h-6 cursor-pointer" />
          <p className="text-center text-white font-medium py-2">
            11 5049-4936
          </p>
        </Link>
      </div>
      <div className="hidden md:flex">
        <Link
          href="https://www.am-motos-repuestos.com.ar/"
          target="_blank"
          className="text-center text-white font-medium py-2"
        >
          Repuestos de motos- visitar{" "}
          <span className="text-yellow-200 underline">AM MOTOS</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="https://www.instagram.com/am.motos1/"
          target="_blank"
          className="text-white"
        >
          <Instagram size={20} />
        </Link>
        <Link
          href="https://www.facebook.com/AM.MOTOSPILAR"
          target="_blank"
          className="text-white"
        >
          <Facebook size={20} />
        </Link>
      </div>
    </div>
  );
};

export default SmallBanner;
