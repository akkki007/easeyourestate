import {
  Shield,
  TrendingUp,
  CheckCircle,
  Truck,
  CreditCard,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Shield,
    title: "Zero Brokerage",
    desc: "Connect directly with owners. No hidden charges, no broker fees. Save up to 2 months rent.",
  },
  {
    Icon: TrendingUp,
    title: "AI-Powered Matching",
    desc: "Our AI engine matches your preferences with the perfect property in seconds.",
  },
  {
    Icon: CheckCircle,
    title: "Verified Listings",
    desc: "Every listing is verified by our team so you never encounter ghost properties.",
  },
  {
    Icon: Truck,
    title: "Packers & Movers",
    desc: "Book trusted packers and movers at the lowest prices — bundled with your rental.",
  },
  {
    Icon: CreditCard,
    title: "Rent Payment",
    desc: "Pay rent online with your credit card, earn reward points and never miss a due date.",
  },
  {
    Icon: Star,
    title: "Top Rated Service",
    desc: "Rated 4.8/5 by over 10 lakh customers across India's top cities.",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
            Why EaseYourEstate.ai
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Smart Real Estate, Powered by AI
          </h2>
          <p className="mt-3 text-muted-foreground">
            We eliminate middlemen so you deal directly with owners and save lakhs in brokerage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
