"use client";

const PLANS = [
 { name:"Free", price: 0, features: ["1 listing","Basic leads","Email support"], color:"gray"},
 { name:"Basic", price: 999, features: ["10 listings","Lead management","Email + Chat support","Basic analytics"], color:"blue"},
 { name:"Pro", price: 2999, features: ["50 listings","Advanced leads","Priority support","Full analytics","Featured slots (3)"], color:"purple", popular: true },
 { name:"Enterprise", price: 9999, features: ["Unlimited listings","Dedicated manager","Custom branding","API access","Bulk upload","Team accounts"], color:"amber"},
];

export default function AdminSubscriptionsPage() {
 return (
 <main className="p-6">
 <div className="mb-8">
 <h2 className="text-lg font-semibold text-primary-foreground">Subscriptions & Plans</h2>
 <p className="text-sm text-muted-foreground mt-1">Manage subscription plans and view billing (payment integration coming soon)</p>
 </div>

 {/* Plans Grid */}
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
 {PLANS.map((plan) => (
 <div
 key={plan.name}
 className={`bg-muted border rounded-xl p-5 relative ${
 plan.popular ?"border-accent":"border-border"
 }`}
 >
 {plan.popular && (
 <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
 Popular
 </span>
 )}
 <h3 className="text-primary-foreground font-semibold mb-1">{plan.name}</h3>
 <p className="text-2xl font-bold text-primary-foreground mb-4">
 {plan.price === 0 ?"Free":`₹${plan.price.toLocaleString()}`}
 {plan.price > 0 && <span className="text-xs text-muted-foreground font-normal">/month</span>}
 </p>
 <ul className="space-y-2 mb-5">
 {plan.features.map((f) => (
 <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
 <svg className="w-4 h-4 text-success shrink-0"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="2">
 <path strokeLinecap="round"strokeLinejoin="round"d="M5 13l4 4L19 7"/>
 </svg>
 {f}
 </li>
 ))}
 </ul>
 <button
 disabled
 className="w-full py-2 rounded-lg border border-border text-muted-foreground text-sm cursor-not-allowed"
 >
 Manage Plan
 </button>
 </div>
 ))}
 </div>

 {/* Placeholder Tables */}
 <div className="bg-muted border border-border rounded-xl p-6 mb-6">
 <h3 className="text-primary-foreground font-semibold mb-4">Active Subscriptions</h3>
 <div className="flex flex-col items-center justify-center py-12">
 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
 <svg className="w-6 h-6 text-muted-foreground"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
 </svg>
 </div>
 <p className="text-muted-foreground text-sm">No active subscriptions yet</p>
 <p className="text-muted-foreground text-xs mt-1">Payment integration (Razorpay) will be added in a future update</p>
 </div>
 </div>

 <div className="bg-muted border border-border rounded-xl p-6">
 <h3 className="text-primary-foreground font-semibold mb-4">Payment History</h3>
 <div className="flex flex-col items-center justify-center py-12">
 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
 <svg className="w-6 h-6 text-muted-foreground"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
 </svg>
 </div>
 <p className="text-muted-foreground text-sm">No payment history</p>
 <p className="text-muted-foreground text-xs mt-1">Invoice generation with GST will be available after payment integration</p>
 </div>
 </div>
 </main>
 );
}
