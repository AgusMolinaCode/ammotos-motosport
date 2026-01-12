"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  content: React.ReactElement | React.ReactNode | string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 max-w-[110rem] mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "")}>
          <motion.div
            className={cn(
              card.className,
              "relative overflow-hidden bg-white rounded-xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
          >
            <ImageComponent card={card} />
            {/* Contenido sobre la imagen */}
            <div className="absolute inset-0 flex items-end">
              <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent w-full pt-32 p-4">
                {card.content}
              </div>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      height="500"
      width="500"
      className={cn(
        "object-cover object-top absolute inset-0 h-full w-full transition duration-200",
        (card.id === 1 || card.id === 2 || card.id === 3 || card.id === 4) && "opacity-100"
      )}
      alt="thumbnail"
    />
  );
};
