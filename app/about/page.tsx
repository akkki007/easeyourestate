import Navbar from "@/components/Navbar";
import { Building2, Home, ShieldCheck, HeartHandshake, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 w-full pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mt-10 md:mt-16 mb-16">
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full mb-6">
              About EYE
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-6">
              Simplifying Your <span className="text-primary italic font-serif font-normal">Real Estate</span> Journey
            </h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            {/* Story Text */}
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p className="text-xl md:text-2xl text-foreground font-medium leading-snug">
                Ease Your Estate is your trusted partner in simplifying real estate decisions—whether you’re buying, selling, or renting.
              </p>
              <p>
                We offer a wide range of verified residential and commercial properties, tailored to suit every budget and lifestyle. From premium homes to rental solutions, our expert team provides personalized guidance, transparent dealings, and seamless support at every step.
              </p>
              <p className="font-medium text-primary border-l-4 border-primary pl-4 py-1">
                Making your real estate journey smooth, smart, and completely stress-free.
              </p>

              {/* Quick stats or highlights */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="space-y-2">
                  <h4 className="text-3xl font-black text-foreground">100%</h4>
                  <p className="text-sm">Verified Properties</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black text-foreground">24/7</h4>
                  <p className="text-sm">Seamless Support</p>
                </div>
              </div>
            </div>

            {/* Visual representation */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                  alt="Modern Home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-background/95 backdrop-blur-md border border-border p-5 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Premium Homes</h3>
                      <p className="text-xs text-muted-foreground">Curated for your lifestyle</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative background bloc */}
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 transform translate-x-4 translate-y-4" />
            </div>
          </div>

          {/* Features / Value Pillars */}
          <div className="py-16 border-t border-border">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">Why Choose Ease Your Estate?</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                We bring transparency, trust, and tailored solutions to the forefront of the real estate market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Transparent Dealings</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No hidden fees or surprises. We believe in complete transparency and honesty throughout your entire real estate journey.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Personalized Guidance</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our expert team works closely with you to understand your specific needs, budgets, and lifestyle requirements.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Verified Properties</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every property listed goes through a strict verification process, ensuring secure and reliable options for you.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
