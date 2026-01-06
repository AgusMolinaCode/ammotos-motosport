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
        <p className="text-center text-white font-medium py-2">
          ¡Envío gratis en pedidos superiores a $100.000!
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link href="https://www.instagram.com/am.motos1/" target="_blank" className="text-white">
          <Instagram size={20} />
        </Link>
        <Link href="https://www.facebook.com/AM.MOTOSPILAR" target="_blank" className="text-white">
          <Facebook size={20} />
        </Link>
      </div>
      {/* <div>
        <p className="text-center text-white font-medium py-2">
          Whatssapp:{" "}
          <Link
            href="https://wa.link/0hyq3z"
            target="_blank"
            className="underline"
          >
            11 5049-4936
          </Link>
        </p>
      </div> */}
    </div>
  );
};

export default SmallBanner;
