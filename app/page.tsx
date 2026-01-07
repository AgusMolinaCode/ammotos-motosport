import SmallBanner from "@/components/main/SmallBanner";
import Navbar from "@/components/main/Navbar";
import SearchBar from "@/components/main/SearchBar";
import Hero from "@/components/main/Hero";
import HeroTwo from "@/components/main/HeroTwo";

export default function Home() {
  return (
    <div>
      <SmallBanner />
      <Navbar />
      <SearchBar />
     {/*  <Hero /> */}
      <HeroTwo />
    </div>
  );
}
