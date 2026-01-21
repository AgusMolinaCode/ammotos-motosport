import SmallBanner from "@/components/main/SmallBanner";
import Navbar from "@/components/main/Navbar";
import SearchBar from "@/components/main/SearchBar";
import HeroTwo from "@/components/main/HeroTwo";
import SliderBrands from "@/components/main/SliderBrands";
import OfferItems from "@/components/main/OfferItems";
import CategoriesItems from "@/components/main/CategoriesItems";

export default function Home() {
  return (
    <div>
      <HeroTwo />
      <SliderBrands />
      <OfferItems />
      <CategoriesItems />
    </div>
  );
}
