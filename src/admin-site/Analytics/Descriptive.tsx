import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Map } from "lucide-react";

interface DescriptiveProps {
    analysis: {
        totalRevenue: number;
        statusData: any[];     // Galing sa statusData ng Analytics
        cabinRevenue: any[];   // Galing sa cabinRevenue ng Analytics
        stayTypeStats: any[];  // Binago para mag-match sa Analytics.tsx mo
        dayTypeStats: any[];   // Binago para mag-match sa Analytics.tsx mo
    };
}

export function Descriptive({ analysis }: DescriptiveProps) {
    const totalRequests = analysis.statusData.reduce((a: any, b: any) => a + b.value, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* SECTION HEADER */}
            <div className="flex items-center gap-3 border-l-4 border-[#D4AF37] pl-4 mb-6">
                <Map className="text-[#D4AF37]" size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
                    Descriptive <span className="text-zinc-400 font-light">Report</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. BOOKING STATUS */}
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col min-h-[480px]">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b pb-3">Booking Status Distribution</h3>

                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analysis.statusData}
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analysis.statusData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-zinc-900 leading-none">{totalRequests}</span>
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Total Requests</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 mt-8">
                        {analysis.statusData.map((status, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: status.color }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{status.name}</span>
                                </div>
                                <span className="text-sm font-black text-zinc-900">{status.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. REVENUE PER CABIN (PIE) */}
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col min-h-[480px]">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b pb-3">Revenue per Cabin</h3>

                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analysis.cabinRevenue}
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analysis.cabinRevenue.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={entry.name.toLowerCase().includes('ohannah') ? '#18181b' : '#D4AF37'}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `₱${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                            <span className="text-xl font-black text-zinc-900 leading-none">₱{analysis.totalRevenue.toLocaleString()}</span>
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Total Income</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        {analysis.cabinRevenue.map((cabin, i) => (
                            <div key={i} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-50 hover:shadow-md transition-all">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{cabin.name}</p>
                                <p className="text-xs font-black text-zinc-900">{cabin.count} Books</p>
                                <p className="text-[11px] font-black text-[#D4AF37]">₱{cabin.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. STAY TYPE & DAY TYPE BREAKDOWN */}
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col min-h-[480px] space-y-12">
                    {/* Stay Type Breakdown */}
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b pb-3">Stay Type Breakdown</h3>
                        <div className="space-y-5">
                            {analysis.stayTypeStats.map((s, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{s.name}</span>
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-zinc-900 uppercase">{s.count} stays</p>
                                        <p className="text-[11px] font-black text-[#D4AF37]">₱{s.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Day Type Breakdown */}
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b pb-3">Day Type Stats</h3>
                        <div className="space-y-5">
                            {analysis.dayTypeStats.map((d, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-zinc-50 pb-2 last:border-0">
                                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{d.name}</span>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-zinc-900 uppercase">{d.count} bookings</p>
                                        <p className="text-[11px] font-black text-emerald-600">₱{d.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}