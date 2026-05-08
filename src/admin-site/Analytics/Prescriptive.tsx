import React, { useState } from 'react';
import {
    Lightbulb,
    Target,
    Zap,
    ShieldCheck,
    Clock,
    Tag,
    ChevronRight,
    X,
    Calculator,
    CalendarDays
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

    const topCabin = [...(analysis.revenueData || [])].sort((a, b) => b.value - a.value)[0];
    const totalBookings = analysis.revenueData?.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const weekendRevenue = analysis.dayStats?.find(d => d.name.toLowerCase().includes('weekend'))?.revenue || 0;
    const weekdayRevenue = analysis.dayStats?.find(d => d.name.toLowerCase().includes('weekday'))?.revenue || 0;

    const highDemandType = weekendRevenue >= weekdayRevenue ? 'weekend' : 'weekday';
    const highDemandRevenue = Math.max(weekendRevenue, weekdayRevenue);
    const lowDemandType = highDemandType === 'weekend' ? 'weekday' : 'weekend';
    const targetRevenue = highDemandType === 'weekend' ? weekendRevenue * 1.15 : weekdayRevenue * 1.1;

    const strategies = [
        {
            id: 'pricing',
            title: "Dynamic Pricing",
            icon: <Tag className="text-[#D4AF37]" size={20} />,
            condition: true,
            recommendation: highDemandType === 'weekend'
                ? "Apply 15% Weekend Premium."
                : "Raise weekday rates on strong midweek demand.",
            details: highDemandType === 'weekend'
                ? "High weekend demand detected. Increasing rates for Friday-Saturday stays optimizes profit without losing bookings."
                : "Weekday demand is stronger in this period. Use value-added weekday packages or a small weekday rate increase to improve revenue.",
            math: highDemandType === 'weekend'
                ? `₱${weekendRevenue.toLocaleString()} (Weekend Rev) × 0.15 = +₱${(weekendRevenue * 0.15).toLocaleString()} Potential Gain. Total Target: ₱${targetRevenue.toLocaleString()}`
                : `₱${weekdayRevenue.toLocaleString()} (Weekday Rev) × 0.10 = +₱${(weekdayRevenue * 0.10).toLocaleString()} Potential Gain. Total Target: ₱${targetRevenue.toLocaleString()}`,
            impact: "Revenue"
        },
        {
            id: 'occupancy',
            title: "Occupancy Boost",
            icon: <Clock className="text-[#D4AF37]" size={20} />,
            condition: true,
            recommendation: "Mid-week 'Stay-More' bundles.",
            details: `Weekday revenue is ₱${weekdayRevenue.toLocaleString()}. A 50% discount on the 3rd night incentivizes longer stays during low-demand days.`,
            math: `₱${weekdayRevenue.toLocaleString()} ÷ ${analysis.dayStats?.find(d => d.name.toLowerCase().includes('weekday'))?.count || 1} (Avg/Night) × 2.5 Nights = Target Revenue per Booking.`,
            impact: "Occupancy"
        },
        {
            id: 'inventory',
            title: "Asset Focus",
            icon: <Target className="text-[#D4AF37]" size={20} />,
            condition: !!topCabin,
            recommendation: `Aggressive Ads for ${topCabin?.name || 'Top Cabin'}.`,
            details: `${topCabin?.name} leads your portfolio. Focus marketing here to maximize conversion rates.`,
            math: `${topCabin?.count || 0} (Cabin Bookings) ÷ ${totalBookings} (Total Bookings) = ${(((topCabin?.count || 0) / (totalBookings || 1)) * 100).toFixed(1)}% Portfolio Contribution.`,
            impact: "Assets"
        },
        {
            id: 'seasonal',
            title: "Seasonal Strategy",
            icon: <CalendarDays className="text-[#D4AF37]" size={20} />,
            condition: true,
            recommendation: "Holiday Peak Adjustment.",
            details: "Block-off common peak holidays 6 months in advance with a 25% base rate increase.",
            math: "Base Rate × 1.25 for red-marked calendar dates.",
            impact: "Scheduling"
        },
        {
            id: 'retention',
            title: "Guest Loyalty",
            icon: <ShieldCheck className="text-[#D4AF37]" size={20} />,
            condition: true,
            recommendation: "10% Re-booking Coupon.",
            details: "Bringing back a past guest is 5x cheaper than acquiring a new one. Send this 30 days after checkout.",
            math: `Average Booking (₱${((weekendRevenue + weekdayRevenue) / (totalBookings || 1)).toLocaleString()}) - 10% Discount = ₱${(((weekendRevenue + weekdayRevenue) / (totalBookings || 1)) * 0.9).toLocaleString()} Net Profit per Return Guest.`,
            impact: "Loyalty"
        },

    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex items-center gap-3 border-l-4 border-[#D4AF37] pl-4 mb-8 text-left">
                <Lightbulb className="text-[#D4AF37]" size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
                    Prescriptive <span className="text-zinc-400 font-light">Strategies</span>
                </h2>
            </div>

            {/* ACTION CARDS - NOW USES FULL WIDTH GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies.map((strat) => (
                    <div
                        key={strat.id}
                        className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:border-[#D4AF37] hover:shadow-md transition-all group flex flex-col justify-between text-left relative overflow-hidden min-h-[220px]"
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
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">View Strategies</span>
                            <ChevronRight className="text-zinc-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" size={16} />
                        </button>

                        {/* MODAL: DETAILS */}
                        {selectedStrategy === strat.id && (
                            <div className="absolute inset-0 z-20 bg-zinc-900 p-6 flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Strategy Detail</span>
                                    <button onClick={() => setSelectedStrategy(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                                </div>
                                <p className="text-white text-xs font-bold leading-relaxed mb-6 italic">{strat.details}</p>
                                <div className="mt-auto py-2 px-4 bg-zinc-800 rounded-lg text-[#D4AF37] text-[10px] font-black uppercase text-center border border-zinc-700">
                                    {strat.impact} Optimization
                                </div>
                            </div>
                        )}

                        {/* MODAL: MATH */}
                        {showMath === strat.id && (
                            <div className="absolute inset-0 z-30 bg-[#D4AF37] p-6 flex flex-col justify-center text-zinc-900 animate-in zoom-in-95 duration-200">
                                <button onClick={() => setShowMath(null)} className="absolute top-6 right-6 text-zinc-800 hover:scale-110 transition-transform"><X size={20} /></button>
                                <Calculator className="mb-4" size={24} />
                                <h5 className="font-black uppercase text-[10px] tracking-widest mb-2">Calculation Breakdown</h5>
                                <p className="font-mono text-[13px] font-black leading-relaxed bg-white/20 p-4 rounded-xl border border-black/10">
                                    {strat.math}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}