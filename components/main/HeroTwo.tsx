"use client";
import React from "react";
import { LayoutGrid } from "../ui/layout-grid";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import { useRouter } from "next/navigation";

function HeroTwo() {
  return (
    <div className="h-screen py-10 w-full">
      <LayoutGrid cards={cards} />
    </div>
  );
}

const SkeletonOne = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-start">
      <p className="font-bold md:text-5xl text-4xl text-white drop-shadow-lg mb-2">
        Productos en Oferta
      </p>
      <p className="font-normal text-lg text-gray-200 drop-shadow-md mb-6 max-w-lg">
        Descubre las mejores ofertas en refacciones para tu auto
      </p>
      <HoverBorderGradient
        containerClassName="rounded-lg"
        as="button"
        onClick={() => router.push("/ofertas")}
        className="bg-black/40 text-white flex items-center gap-2 px-5 py-2 text-base cursor-pointer"
      >
        <span>Ver Ofertas</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </HoverBorderGradient>
    </div>
  );
};

const SkeletonTwo = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-start">
      <p className="font-bold md:text-4xl text-3xl text-white drop-shadow-lg mb-2">
        Suspension Ohlins
      </p>
      <p className="font-normal text-base text-gray-200 drop-shadow-md mb-4 max-w-sm">
        La mejor suspension de alto rendimiento para tu auto
      </p>
      <HoverBorderGradient
        containerClassName="rounded-lg"
        as="button"
        onClick={() => router.push("/ohlins")}
        className="bg-black/40 text-white flex items-center gap-2 px-5 py-2 text-base cursor-pointer"
      >
        <span>Ver Productos</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </HoverBorderGradient>
    </div>
  );
};
const SkeletonThree = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-start">
      <p className="font-bold md:text-4xl text-3xl text-white drop-shadow-lg mb-2">
        Sparco
      </p>
      <p className="font-normal text-base text-gray-200 drop-shadow-md mb-4 max-w-sm">
        Comodidad y estilo para tu auto
      </p>
      <HoverBorderGradient
        containerClassName="rounded-lg"
        as="button"
        onClick={() => router.push("/sparco")}
        className="bg-black/40 text-white flex items-center gap-2 px-5 py-2 text-base cursor-pointer"
      >
        <span>Ver Productos</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </HoverBorderGradient>
    </div>
  );
};
const SkeletonFour = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-start">
      <p className="font-bold md:text-5xl text-4xl text-white drop-shadow-lg mb-2">
        Filtros de aire
      </p>
      <p className="font-normal text-lg text-gray-200 drop-shadow-md mb-6 max-w-lg">
        Los mejores accesorios para tu auto
      </p>
      <HoverBorderGradient
        containerClassName="rounded-lg"
        as="button"
        onClick={() => router.push("/kyn")}
        className="bg-black/40 text-white flex items-center gap-2 px-5 py-2 text-base cursor-pointer"
      >
        <span>Ver Productos</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </HoverBorderGradient>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: <SkeletonOne />,
    className: "md:col-span-2",
    thumbnail: "/akra.jpg",
  },
  {
    id: 2,
    content: <SkeletonTwo />,
    className: "col-span-1",
    thumbnail: "/ohlins.jpg",
  },
  {
    id: 3,
    content: <SkeletonThree />,
    className: "col-span-1",
    thumbnail: "/sparco.jpg",
  },
  {
    id: 4,
    content: <SkeletonFour />,
    className: "md:col-span-2",
    thumbnail: "/kyn.jpg",
  },
];

export default HeroTwo;