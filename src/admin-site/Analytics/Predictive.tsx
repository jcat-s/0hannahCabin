import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Sparkles, ArrowUpRight, ArrowDownRight, Calculator, Minus, X, Users, Clock, Star, Banknote } from "lucide-react";
import { format, eachMonthOfInterval, subMonths, isSameMonth, parseISO, addMonths } from 'date-fns';

interface PredictiveProps {
    bookings: any[];
}

export function Predictive({ bookings }: PredictiveProps) {
    const [activeModal, setActiveModal] = useState<'growth' | 'forecast' | 'occupancy' | 'guests' | 'peak' | null>(null);

    const predictions = useMemo(() => {
        const now = new Date();
        const nextMonthDate = addMonths(now, 1);
        const targetMonthName = format(nextMonthDate, 'MMMM'); // Gets "July" if now is June

        const last6Months = eachMonthOfInterval({
            start: subMonths(now, 5),
            end: now
        });

        const historicalData = last6Months.map(month => {
            const monthBookings = bookings.filter(b => isSameMonth(parseISO(b.checkInDate || b.checkIn), month));
            return {
                month: format(month, 'MMM'),
                revenue: monthBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
                bookings: monthBookings.length,
                guests: monthBookings.reduce((sum, b) => sum + (Number(b.adults || 0) + Number(b.children || 0)), 0)
            };
        });

        const revenues = historicalData.map(d => d.revenue);
        const lastMonthRevenue = revenues[revenues.length - 1] || 0;
        const prevMonthRevenue = revenues[revenues.length - 2] || 0;

        // 1. REVENUE GROWTH
        let growthResult = 0;
        if (prevMonthRevenue > 0) {
            growthResult = (lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue;
        }
        const growthPercentage = growthResult * 100;
        const multiplier = 1 + growthResult;

        // 2. FORECAST (Next Month)
        let nextMonthForecast = lastMonthRevenue * multiplier;
        if (nextMonthForecast < 0) nextMonthForecast = 0;

        // 3. OCCUPANCY & GUESTS
        const avgMonthlyBookings = historicalData.reduce((a, b) => a + b.bookings, 0) / 6;
        const predictedOccupancy = Math.min((avgMonthlyBookings / 30) * 100 * (1 + growthResult), 100);

        const avgGuests = historicalData.reduce((a, b) => a + b.guests, 0) / 6;
        const predictedGuests = avgGuests * (1 + (growthResult * 0.5));

        return {
            targetMonthName,
            historicalData,
            lastMonthRevenue,
            prevMonthRevenue,
            nextMonthForecast,
            growthPercentage: Math.abs(growthPercentage),
            growthRaw: growthPercentage,
            growthResult,
            multiplier,
            predictedOccupancy,
            predictedGuests,
            peakMonth: [...historicalData].sort((a, b) => b.bookings - a.bookings)[0]
        };
    }, [bookings]);

    // Modal Component for Math Explanations
    const MathModal = ({ type, title, children }: { type: string, title: string, children: React.ReactNode }) => (
        <div className="absolute inset-0 z-50 bg-zinc-900/98 backdrop-blur-md text-white p-8 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300 text-left">
            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
            <div className="max-w-md w-full mx-auto">
                <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                    <Calculator className="text-[#D4AF37]" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h4>
                </div>
                <div className="space-y-4 font-mono text-sm leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* SECTION HEADER */}
            <div className="flex items-center gap-3 border-l-4 border-[#D4AF37] pl-4 mb-6 text-left">
                <TrendingUp className="text-[#D4AF37]" size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
                    Predictive <span className="text-zinc-400 font-light">Analytics</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

                {/* 1. REVENUE TREND (Gold Line Chart) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col relative overflow-hidden min-h-[500px]">
                    <div className="flex justify-between items-start mb-8 relative z-10 text-left">
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Monthly Revenue Trend</h3>
                            <p className="text-sm text-zinc-500 font-medium">Performance over the last 6 months</p>
                        </div>

                        <button
                            onClick={() => setActiveModal('growth')}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${predictions.growthRaw >= 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                                } hover:scale-105 shadow-lg shadow-zinc-100`}
                        >
                            {predictions.growthRaw >= 0 ? <ArrowUpRight size={14} className="text-[#D4AF37]" /> : <ArrowDownRight size={14} className="text-red-500" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {predictions.growthPercentage.toFixed(1)}% Momentum
                            </span>
                        </button>
                    </div>

                    {activeModal === 'growth' && (
                        <MathModal type="growth" title="Growth Computation">
                            <p className="text-zinc-500 text-[10px] mb-2 uppercase">Formula: ((Current - Previous) / Previous) * 100</p>
                            <div className="p-4 bg-zinc-800 rounded-xl border border-zinc-700">
                                <div className="flex justify-between mb-1"><span>Current Month:</span> <span>₱{predictions.lastMonthRevenue.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Previous Month:</span> <span>₱{predictions.prevMonthRevenue.toLocaleString()}</span></div>
                            </div>
                            <p className="text-[#D4AF37] font-black text-center text-lg mt-4">= {predictions.growthRaw.toFixed(2)}% Performance Change</p>
                            <p className="text-[10px] text-zinc-500 mt-2 text-center">This percentage dictates the "Multiplier" used for future projections.</p>
                        </MathModal>
                    )}

                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={predictions.historicalData}>
                                <defs>
                                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} dy={10} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                {/* LINE IS NOW GOLD (#D4AF37) */}
                                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorGold)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. FORECAST COLUMN */}
                <div className="space-y-6 flex flex-col min-h-[500px]">
                    <div className="bg-[#18181b] p-8 rounded-[2.5rem] text-white relative overflow-hidden border border-zinc-800 shadow-xl h-full flex flex-col">

                        <div className="text-left mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    Forecast for {predictions.targetMonthName}
                                </h3>
                                <button onClick={() => setActiveModal('forecast')} className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all active:scale-95">
                                    <Banknote className="text-[#D4AF37]" size={18} />
                                </button>
                            </div>
                            <p className="text-4xl font-black tracking-tighter mb-2 text-[#D4AF37]">
                                ₱{predictions.nextMonthForecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Estimated Revenue</p>
                        </div>

                        {activeModal === 'forecast' && (
                            <MathModal type="forecast" title="Revenue Prediction Logic">
                                <div className="space-y-4">
                                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                                        <p className="text-[9px] text-zinc-500 uppercase mb-1">Step 1: Trend Multiplier</p>
                                        <p className="text-white text-xs">1 + ({predictions.growthResult.toFixed(3)} Growth) = <span className="text-[#D4AF37]">{predictions.multiplier.toFixed(3)}x</span></p>
                                    </div>
                                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                                        <p className="text-[9px] text-zinc-500 uppercase mb-1">Step 2: Projection</p>
                                        <p className="text-white text-xs">Current ₱{predictions.lastMonthRevenue.toLocaleString()} × {predictions.multiplier.toFixed(3)} Multiplier</p>
                                    </div>
                                    <div className="pt-4 border-t border-zinc-800 flex justify-between font-black text-[#D4AF37] text-lg">
                                        <span>Result:</span>
                                        <span>₱{predictions.nextMonthForecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 italic leading-snug">
                                        This forecast assumes market conditions remain consistent with the current month's trajectory.
                                    </p>
                                </div>
                            </MathModal>
                        )}

                        <div className="grid grid-cols-1 gap-4 mt-auto">
                            {/* EXPECTED OCCUPANCY */}
                            <div onClick={() => setActiveModal('occupancy')} className="bg-zinc-800/40 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 text-left cursor-pointer hover:bg-zinc-800/60 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-[#D4AF37]">
                                    <Clock className="text-[#D4AF37]" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Expected Occupancy</h4>
                                    <p className="text-sm font-black text-white">{predictions.predictedOccupancy.toFixed(1)}% Capacity</p>
                                </div>
                            </div>

                            {/* PREDICTED GUESTS */}
                            <div onClick={() => setActiveModal('guests')} className="bg-zinc-800/40 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 text-left cursor-pointer hover:bg-zinc-800/60 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-[#D4AF37]">
                                    <Users className="text-[#D4AF37]" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Guest Count Prediction</h4>
                                    <p className="text-sm font-black text-white">{Math.round(predictions.predictedGuests)} Estimated Visitors</p>
                                </div>
                            </div>

                            {/* PEAK PERFORMANCE */}
                            <div onClick={() => setActiveModal('peak')} className="bg-zinc-800/40 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 text-left cursor-pointer hover:bg-zinc-800/60 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-[#D4AF37]">
                                    <Star className="text-[#D4AF37]" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Historical Peak Month</h4>
                                    <p className="text-sm font-black text-white">{predictions.peakMonth?.month || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* OTHER MODALS */}
                        {activeModal === 'occupancy' && (
                            <MathModal type="occupancy" title="Occupancy Logic">
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Calculated by taking the average booking volume of the last 6 months ({Math.round(predictions.historicalData.reduce((a, b) => a + b.bookings, 0) / 6)} bookings)
                                    and adjusting it by the current trend factor.
                                </p>
                                <p className="text-white mt-2">Targeting ~{predictions.predictedOccupancy.toFixed(1)}% of available nights for {predictions.targetMonthName}.</p>
                            </MathModal>
                        )}

                        {activeModal === 'guests' && (
                            <MathModal type="guests" title="Guest Volume Calculation">
                                <p className="text-zinc-400 text-xs">
                                    Analyzes the average guest-to-booking ratio across all historical stays.
                                </p>
                                <div className="p-3 bg-zinc-800 rounded-lg text-[#D4AF37] font-black text-center mt-2">
                                    ~ {Math.round(predictions.predictedGuests)} Guests Predicted
                                </div>
                                <p className="text-[9px] text-zinc-500 italic mt-2">Useful for manpower and resource allocation.</p>
                            </MathModal>
                        )}

                        {activeModal === 'peak' && (
                            <MathModal type="peak" title="Peak Season Insights">
                                <p className="text-zinc-400 text-xs">
                                    Identified through historical volume. Your strongest month was <span className="text-white">{predictions.peakMonth?.month}</span> with {predictions.peakMonth?.bookings} confirmed stays.
                                </p>
                                <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-widest">Recommended Action:</p>
                                <p className="text-white text-xs">Consider a 10-15% premium price adjustment during this cycle next year.</p>
                            </MathModal>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}