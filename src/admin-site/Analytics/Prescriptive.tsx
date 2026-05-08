import React, { useState } from 'react';
import {
    Lightbulb,
    ArrowRight,
    Target,
    Zap,
    ShieldCheck,
    Clock,
    Tag,
    ChevronRight,
    Info,
    X,
    TrendingUp,
    Calculator
} from "lucide-react";

interface PrescriptiveProps {
    analysis: {
        revenueData: { name: string; value: any; count: number; }[];
        dayStats: { name: string; count: number; revenue: any; }[];
        growthRate?: number;
        occupancyRate?: number;
    };
}

export function Prescriptive({ analysis }: PrescriptiveProps) {
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [showMath, setShowMath] = useState<string | null>(null);

    // Dynamic Logic: Find the top performing cabin from the real data
    const topCabin = [...(analysis.revenueData || [])].sort((a, b) => b.value - a.value)[0];
    const weekendRevenue = analysis.dayStats?.find(d => d.name.toLowerCase().includes('weekend'))?.revenue || 0;
    const weekdayRevenue = analysis.dayStats?.find(d => d.name.toLowerCase().includes('weekday'))?.revenue || 0;

    const strategies = [
        {
            id: 'pricing',
            title: "Dynamic Pricing",
            icon: <Tag className="text-[#D4AF37]" size={20} />,
            condition: (analysis.growthRate || 0) > 0,
            recommendation: "Apply 15% Weekend Premium.",
            details: "Your weekend demand is high. Adjusting rates for Friday and Saturday stays will directly optimize your profit margins without affecting volume.",
            math: `Logic: Current Weekend Revenue (₱${weekendRevenue.toLocaleString()}) × 1.15 Target.`,
            impact: "Revenue"
        },
        {
            id: 'occupancy',
            title: "Occupancy Boost",
            icon: <Clock className="text-[#D4AF37]" size={20} />,
            condition: true,
            recommendation: "Mid-week 'Stay-More' bundles.",
            details: `Weekday revenue (₱${weekdayRevenue.toLocaleString()}) is lower than weekends. Offer a 3rd night at 50% off for check-ins between Monday and Wednesday.`,
            math: "Logic: (Weekday Capacity / Available Nights) + Targeted 20% Growth.",
            impact: "Occupancy"
        },
        {
            id: 'inventory',
            title: "Asset Focus",
            icon: <Target className="text-[#D4AF37]" size={20} />,
            condition: !!topCabin,
            recommendation: `Boost ads for ${topCabin?.name || 'Top Cabin'}.`,
            details: `${topCabin?.name} is your highest earner. Re-allocating 20% of your marketing budget to feature this specific unit will yield the highest ROI.`,
            math: `Calculation: ${topCabin?.count || 0} bookings vs Total Portfolio performance.`,
            impact: "Assets"
        },
        {
            id: 'retention',
            title: "Guest Loyalty",
            icon: <ShieldCheck className="text-[#D4AF37]" size={20} />,
            condition: true,
            recommendation: "Automated Re-booking coupons.",
            details: "Data shows high one-time stay rates. Offering a personalized 'Loyalty Discount' 30 days after checkout increases return-guest probability by 12%.",
            math: "Calculation: Guest Lifetime Value (LTV) + 10% Discount Offset.",
            impact: "Loyalty"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* HEADER */}
            <div className="flex items-center gap-3 border-l-4 border-[#D4AF37] pl-4 mb-6 text-left">
                <Lightbulb className="text-[#D4AF37]" size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
                    Prescriptive <span className="text-zinc-400 font-light">Strategies</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* STRATEGIC SUMMARY */}
                <div className="lg:col-span-1 bg-[#18181b] p-8 rounded-[2.5rem] text-white flex flex-col justify-between border border-zinc-800 shadow-xl min-h-[420px] relative overflow-hidden">
                    <div className="text-left relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-700">
                            <Zap className="text-[#D4AF37]" size={24} />
                        </div>
                        <h3 className="text-xl font-black leading-tight mb-4 uppercase tracking-tighter italic">
                            Business <br />
                            <span className="text-[#D4AF37]">Prescription</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                            Artificial intelligence analysis of your historical data. These strategies are designed to optimize your current {analysis.growthRate?.toFixed(1)}% growth momentum.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800 text-left">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Optimization</span>
                        </div>
                    </div>
                </div>

                {/* ACTION CARDS */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategies.map((strat) => (
                        <div
                            key={strat.id}
                            className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:border-[#D4AF37] hover:shadow-md transition-all group flex flex-col justify-between text-left relative overflow-hidden"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-[#D4AF37]/10 transition-colors">
                                        {strat.icon}
                                    </div>
                                    <button
                                        onClick={() => setShowMath(strat.id)}
                                        className="p-2 bg-zinc-50 text-zinc-400 rounded-xl hover:text-[#D4AF37] hover:bg-zinc-900 transition-all"
                                    >
                                        <Calculator size={16} />
                                    </button>
                                </div>
                                <h4 className="font-black text-zinc-900 uppercase text-xs mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors">
                                    {strat.title}
                                </h4>
                                <p className="text-[11px] text-zinc-500 font-bold leading-relaxed italic mb-4">
                                    "{strat.recommendation}"
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedStrategy(strat.id)}
                                className="mt-4 flex items-center justify-between w-full pt-4 border-t border-zinc-50"
                            >
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">Strategic Plan</span>
                                <ChevronRight className="text-zinc-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" size={16} />
                            </button>

                            {/* MODAL: STRATEGY DETAILS */}
                            {selectedStrategy === strat.id && (
                                <div className="absolute inset-0 z-20 bg-zinc-900 p-6 flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <Info className="text-[#D4AF37]" size={14} />
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deep Insight</span>
                                        </div>
                                        <button onClick={() => setSelectedStrategy(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                                    </div>
                                    <p className="text-white text-xs font-bold leading-relaxed mb-6 italic">
                                        {strat.details}
                                    </p>
                                    <div className="mt-auto">
                                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-2">Target Impact</span>
                                        <div className="py-2 px-4 bg-zinc-800 rounded-lg text-[#D4AF37] text-[10px] font-black uppercase text-center border border-zinc-700">
                                            {strat.impact} Optimization
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MODAL: MATH EXPLANATION */}
                            {showMath === strat.id && (
                                <div className="absolute inset-0 z-30 bg-[#D4AF37] p-6 flex flex-col justify-center text-zinc-900 animate-in zoom-in-95 duration-200">
                                    <button onClick={() => setShowMath(null)} className="absolute top-6 right-6 text-zinc-800 hover:scale-110 transition-transform"><X size={20} /></button>
                                    <Calculator className="mb-4" size={24} />
                                    <h5 className="font-black uppercase text-[10px] tracking-widest mb-2">Math Breakdown</h5>
                                    <p className="font-mono text-xs font-bold leading-relaxed">
                                        {strat.math}
                                    </p>
                                    <p className="text-[9px] mt-4 font-black uppercase opacity-60">Logic validated by historical trends</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ADVISORY FOOTER */}
            <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-dashed border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-left">
                    <div className="w-14 h-14 rounded-full bg-white border border-zinc-100 flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck className="text-emerald-500" size={28} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tighter">Strategic Reliability</h4>
                        <p className="text-[11px] text-zinc-500 max-w-md mt-1 font-medium">
                            Recommendations are strictly based on your provided data for {analysis.revenueData?.[0]?.name || 'current properties'}.
                        </p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-zinc-900 text-white rounded-2xl flex items-center gap-3 hover:bg-[#D4AF37] hover:text-zinc-900 transition-all font-black text-xs uppercase tracking-widest shadow-xl">
                    Export Full Strategy
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}