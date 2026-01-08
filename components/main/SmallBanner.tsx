import Link from "next/link";
import React from "react";
import { Instagram, Facebook } from "lucide-react";

const SmallBanner = () => {
  return (
    <div className="h-10 bg-blue-900/70 flex justify-around items-center">
      <div>
        <p className="text-center text-white font-medium py-2">
          Soporte 24/7:{" "}
          <Link href="mailto:am.motos@hotmail.com" className="underline">
            am.motos@hotmail.com
          </Link>
        </p>
      </div>
      <div>
        <Link href="https://www.am-motos-repuestos.com.ar/" target="_blank" className="text-center text-white font-medium py-2">
          Repuestos de motos- visitar <span className="text-yellow-200 underline">AM MOTOS</span>
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
