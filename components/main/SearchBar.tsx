import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Menu, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WhatsApp } from "@/public/whatssapp";

const SearchBar = () => {
  return (
    <div className="h-20  flex justify-between items-center gap-4 max-w-[110rem] mx-auto ">
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex justify-around items-center cursor-pointer bg-indigo-950/90 px-4 h-14 rounded-full w-70">
            <p className="text-2xl font-medium text-white">Productos</p>
            <Menu className="h-8 w-8 text-3xl text-white font-bold stroke-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuItem className="font-medium text-xl flex justify-between">
              Motor
              <ChevronRight className="h-8 w-8 font-bold stroke-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-medium text-xl flex justify-between">
              Motor
              <ChevronRight className="h-8 w-8 font-bold stroke-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-medium text-xl flex justify-between">
              Motor
              <ChevronRight className="h-8 w-8 font-bold stroke-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-medium text-xl flex justify-between">
              Motor
              <ChevronRight className="h-8 w-8 font-bold stroke-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-medium text-xl flex justify-between">
              Motor
              <ChevronRight className="h-8 w-8 font-bold stroke-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative xl:w-[900px] h-14 flex items-center bg-white rounded-full overflow-hidden">
        <Input
          type="text"
          placeholder="Buscar productos..."
          className="flex-1 h-full rounded-l-full focus-visible:ring-0 focus-visible:ring-offset-0 px-4 border border-neutral-600"
        />
        <div className="w-1/4 h-full bg-black flex items-center cursor-pointer justify-center rounded-r-full">
          <span className="text-white font-semibold text-lg">BUSCAR</span>
        </div>{" "}
      </div>
      <div className="flex items-center justify-center gap-3">
        <WhatsApp className="w-10 h-10  cursor-pointer" />
        <p className="text-3xl font-semibold">11 5049-4936</p>
      </div>
    </div>
  );
};

export default SearchBar;
