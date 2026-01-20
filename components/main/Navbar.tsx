"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, ShoppingCart, UserRound, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col px-4 py-2 space-y-4">
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            className="text-xl font-medium py-2 border-b border-gray-200"
          >
            Home
          </Link>
          <Link
            href="/test-brands"
            onClick={() => setIsSidebarOpen(false)}
            className="text-xl font-medium py-2 border-b border-gray-200"
          >
            Marcas
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="relative h-12 overflow-hidden rounded-md border border-neutral-200 bg-transparent px-2 text-neutral-950 before:absolute before:bottom-0 before:left-0 before:block before:h-full before:w-full before:-translate-x-full before:bg-gray-300/50 before:transition-transform hover:before:translate-x-0 flex items-center justify-center gap-2 cursor-pointer w-full mt-4"
          >
            <UserRound className="w-5 h-5 text-gray-600" />
            <h1 className="text-base font-medium">Mayoristas</h1>
          </button>
        </nav>
      </div>

      {/* Navbar principal */}
      <div className="flex justify-between items-center py-4 max-w-[110rem] mx-auto px-2">
        <div className="flex items-center">
          

          <div>
            <Link href="/">
              <Image
                src="/logo2.png"
                alt="Logo"
                width={500}
                height={500}
                className="object-center xs:w-[180px] xs:h-[50px] sm:w-[260px] sm:h-[60px] md:w-[360px] md:h-[90px] lg:w-[370px] lg:h-[90px] xl:w-[420px] xl:h-[86px]"
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center ml-6 gap-2 space-x-4">
            <div>
              <Link href="/" className="text-xl lg:text-2xl font-medium">
                <button
                  role="link"
                  className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100 cursor-pointer"
                >
                  Home
                </button>
              </Link>

              <Link href="/test-brands" className="text-xl lg:text-2xl font-medium ml-6">
                <button
                  role="link"
                  className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100 cursor-pointer"
                >
                  Marcas
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button className="relative h-12 overflow-hidden rounded-md border border-neutral-200 bg-transparent px-2 lg:px-6 text-neutral-950 before:absolute before:bottom-0 before:left-0 before:block before:h-full before:w-full before:-translate-x-full before:bg-gray-300/50 before:transition-transform hover:before:translate-x-0 flex items-center gap-3 cursor-pointer hidden md:flex">
            <span className="relative flex items-center gap-2 lg:gap-3 ">
              <UserRound className="w-7 h-7 text-gray-600" />
              <h1 className="text-lg font-medium">Mayoristas</h1>
            </span>
          </button>
          <Minus className="w-8 h-8 text-black mx-2 rotate-90 hidden md:block" />
          <ShoppingCart className="w-7 h-7 text-black ml-2 lg:ml-4 cursor-pointer" />
        </div>
        {/* Menu button para mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mr-3 p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-7 h-7" />
          </button>
      </div>
    </>
  );
};

export default Navbar;
