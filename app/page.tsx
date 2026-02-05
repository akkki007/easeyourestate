import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PropertyCategories from "@/components/PropertyCategories";
import FeaturedProperties from "@/components/FeaturedProperties";
import Localities from "@/components/Localities";
import MarketInsights from "@/components/MarketInsights";
import WhyChoose from "@/components/WhyChoose";
import AgentsShowcase from "@/components/AgentsShowcase";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-w-light-bg">
      <Navbar />
      <Hero />
      <PropertyCategories />
      <FeaturedProperties />
      <Localities />
      <MarketInsights />
      <WhyChoose />
      <AgentsShowcase />
      <BlogSection />
      <CTASection />
      <Footer />
    </main>
  );
}
