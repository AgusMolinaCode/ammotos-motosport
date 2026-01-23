"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Home } from "lucide-react";
import { WhatsApp } from "@/public/whatssapp";

const Footer = () => {
  return (
    <footer className=" border-t border-gray-200 mt-auto">
      <div className="max-w-[110rem] mx-auto px-2 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={45}
              className="object-cover w-[280px] h-[100px]"
            />
          </Link>

          {/* Botones */}
          <div className="flex items-center gap-3">
            {/* Boton Home */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            {/* WhatsApp */}
            <a
              href="https://wa.me/1150494936"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2  text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <WhatsApp className="w-8 h-8 cursor-pointer" />
              <span className="font-medium text-black">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Ammos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
