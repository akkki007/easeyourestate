"use client";

import { TrendingUp, BarChart3, Download, ArrowUpRight } from "lucide-react";

export default function MarketInsights() {
    return (
        <section className="bg-w-insights w-full py-24 px-6 text-white relative overflow-hidden">
            {/* Background Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-w-brand/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Text & Stats */}
                    <div>
                        <span className="text-w-badge font-bold tracking-widest uppercase text-sm mb-2 block">Data Driven Decisions</span>
                        <h2 className="text-white text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                            Market Trends & <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">Price Insights</span>
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed font-light">
                            Track real-time price fluctuations, inventory levels, and buyer demand across premium Indian localities. Make informed investment decisions with our proprietary data.
                        </p>

                        <div className="space-y-6">
                            <div className="glass-card p-6 rounded-2xl flex gap-5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="size-12 rounded-xl bg-w-brand/20 flex items-center justify-center text-white shrink-0">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-white mb-1 flex items-center gap-2">
                                        +18.5% Growth <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> YoY</span>
                                    </h4>
                                    <p className="text-blue-200 text-sm">Average capital appreciation in <strong className="text-white">DLF Camellias, Gurgaon</strong></p>
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-2xl flex gap-5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-white shrink-0">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-white mb-1">High Demand Zone</h4>
                                    <p className="text-blue-200 text-sm">Inventory in <strong className="text-white">Bandra West, Mumbai</strong> is at an all-time low (Seller&apos;s Market).</p>
                                </div>
                            </div>
                        </div>

                        <button className="mt-10 flex items-center gap-3 bg-white text-w-insights hover:bg-gray-100 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:translate-y-[-2px]">
                            Download Annual Report <Download className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chart Visualization */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <p className="text-xs tracking-wider text-blue-200 font-bold uppercase mb-1">Avg Price / Sq.ft</p>
                                <h3 className="text-2xl font-bold text-white font-serif">Mumbai Luxury Market</h3>
                            </div>
                            <select className="bg-black/30 border border-white/20 rounded-lg text-white text-sm p-2 outline-none focus:border-white/50 cursor-pointer backdrop-blur-sm">
                                <option className="text-black bg-white">Last 12 Months</option>
                                <option className="text-black bg-white">Last 3 Years</option>
                            </select>
                        </div>

                        {/* Custom Chart UI */}
                        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
                            {[40, 55, 45, 60, 75, 65, 90, 95].map((height, i) => (
                                <div key={i} className="flex-1 w-full relative group mx-1 flex items-end">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-100 ${i > 5
                                                ? 'bg-gradient-to-t from-purple-600 to-blue-400 opacity-100 shadow-lg shadow-purple-500/30'
                                                : 'bg-white/40 hover:bg-white/60'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                                        ₹ {10 + i * 1.5}k
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between mt-6 text-xs text-blue-300 font-bold tracking-widest">
                            <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span><span>JAN</span><span>MAR</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
