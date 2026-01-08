import SmallBanner from "@/components/main/SmallBanner";
import Navbar from "@/components/main/Navbar";
import SearchBar from "@/components/main/SearchBar";
import Hero from "@/components/main/Hero";
import HeroTwo from "@/components/main/HeroTwo";
import SliderBrands from "@/components/main/SliderBrands";

export default function Home() {
  return (
    <div>
      <SmallBanner />
      <Navbar />
      <div className="bg-orange-100/30 w-full border border-neutral-600">
        <SearchBar />
      </div>
      {/*  <Hero /> */}
      <HeroTwo />
      <SliderBrands />
    </div>
  );
}
