import SmallBanner from "@/components/main/SmallBanner";
import Navbar from "@/components/main/Navbar";
import SearchBar from "@/components/main/SearchBar";
import HeroTwo from "@/components/main/HeroTwo";
import SliderBrands from "@/components/main/SliderBrands";
import UpdateItems from "@/components/main/UpdateItems";
import OfferItems from "@/components/main/OfferItems";

export default function Home() {
  return (
    <div>
      {/*  <Hero /> */}
      <HeroTwo />
      <SliderBrands />
      <OfferItems />
      {/* <UpdateItems /> */}
    </div>
  );
}
