import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-20 bg-linear-to-br from-primary to-accent-hover">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground mb-4">
          Do you know how much{" "}
          <span className="underline decoration-primary-foreground/60 underline-offset-4">loan</span> you can get?
        </h2>
        <p className="text-primary-foreground/80 mb-8">
          Get maximum home loan benefits with EaseYourEstate.ai. Check your eligibility in 2 minutes — no paperwork needed.
        </p>
        <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-card text-primary font-bold text-sm hover:bg-card/90 transition-colors shadow-lg">
          Check Eligibility
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
