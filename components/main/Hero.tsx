"use client";
import { motion } from "motion/react";
import React from "react";
import { ImagesSlider } from "../ui/images-slider";

function Hero() {
  const images = [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c3d?w=1920&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1920&q=80",
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1920&q=80",
    "https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=1920&q=80",
    "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1920&q=80",
  ];
  return (
    <ImagesSlider className="h-[50rem]" images={images}>
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1.6,
        }}
        className="z-50 flex flex-col justify-center items-center"
      >
        <motion.p className="font-bold text-xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4">
          The hero section slideshow <br /> nobody asked for
        </motion.p>
        <button className="px-4 py-2 backdrop-blur-sm border bg-emerald-300/10 border-emerald-500/20 text-white mx-auto text-center rounded-full relative mt-4">
          <span>Join now →</span>
          <div className="absolute inset-x-0  h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-emerald-500 to-transparent" />
        </button>
      </motion.div>
    </ImagesSlider>
  );
}

export default Hero;