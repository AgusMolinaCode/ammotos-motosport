"use client";
import Image from "next/image";
import React from "react";

const HeroTwo = () => {
  return (
    <div className="relative w-full h-[35rem] overflow-hidden">
      {/* Image */}
      <Image
        src="/parts1.jpg"
        alt="Hero Image"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay con opacidad */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Texto */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          AMMOTOS
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 max-w-2xl drop-shadow-md">
          Las mejores refacciones para tu moto
        </p>
      </div>
    </div>
  );
};

export default HeroTwo;