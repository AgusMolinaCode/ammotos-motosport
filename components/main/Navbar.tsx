import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, ShoppingCart, UserRound } from "lucide-react";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center py-12 max-w-[110rem] mx-auto">
      <div className="flex">
        <div>
          <Link href="/">
            <Image
              src="/logo2.png"
              alt="Logo"
              width={500}
              height={500}
              className="object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center ml-6 gap-2 space-x-4">
          <div>
            <Link href="/" className="text-2xl font-medium">
              <button
                role="link"
                className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100 cursor-pointer"
              >
                Home
              </button>
            </Link>

            <Link href="/test-products" className="text-2xl font-medium ml-6">
              <button
                role="link"
                className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100 cursor-pointer"
              >
                Productos
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <button className="relative h-12 overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 text-neutral-950 before:absolute before:bottom-0 before:left-0 before:block before:h-full before:w-full before:-translate-x-full before:bg-gray-300/50 before:transition-transform hover:before:translate-x-0 flex items-center gap-3 cursor-pointer">
          <span className="relative flex items-center gap-3 ">
            <UserRound className="w-7 h-7 text-gray-600" />
            <h1 className="text-lg font-medium">Mayoristas</h1>
          </span>
        </button>
        <Minus className="w-8 h-8 text-black mx-2 rotate-90" />
        <ShoppingCart className="w-7 h-7 text-black ml-4 cursor-pointer" />
      </div>
    </div>
  );
};

export default Navbar;
