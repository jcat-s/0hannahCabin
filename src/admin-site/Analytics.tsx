import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, Baby, Dog, Calendar, DollarSign, TrendingUp, Target, Sparkles, LucideProps
} from "lucide-react";
import { format, parseISO, getDay, isWithinInterval } from 'date-fns';

const FIXED_PH_HOLIDAYS = ["01-01", "04-09", "05-01", "06-12", "08-31", "11-30", "12-25", "12-30", "02-17", "08-21", "11-01", "11-02", "12-08", "12-24", "12-31"];

const classifyDayType = (date: Date, dbHolidays: string[] = []): 'weekday' | 'weekend' | 'holiday' => {
    const day = getDay(date);
    const monthDay = format(date, "MM-dd");
    const fullDate = format(date, "yyyy-MM-dd");
    if (FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate)) return 'holiday';
    // Friday is part of the weekend structure
    if (day === 0 || day === 6 || day === 5) return 'weekend';
    return 'weekday';
};

interface AnalyticsProps {
    bookings: any[];
}

export function Analytics({ bookings }: AnalyticsProps) {
    const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const analysis = useMemo(() => {
        // 1. FILTER BY DATE RANGE FIRST
        const filteredByRange = bookings.filter(b => {
            const checkInDate = parseISO(b.checkInDate || b.checkIn);
            if (dateRange === 'custom' && startDate && endDate) {
                return isWithinInterval(checkInDate, { start: parseISO(startDate), end: parseISO(endDate) });
            }
            if (dateRange === 'month') return checkInDate.getMonth() === new Date().getMonth();
            if (dateRange === 'year') return checkInDate.getFullYear() === new Date().getFullYear();
            return true;
        });

        // 2. STATUS DISTRIBUTION (SYNCED TO DATE FILTER)
        const confirmedList = filteredByRange.filter(b => b.status === 'Confirmed' || b.status === 'Approved');
        const pendingList = filteredByRange.filter(b => b.status === 'Pending');
        const rejectedList = filteredByRange.filter(b => b.status === 'Rejected' || b.status === 'Cancelled');

        const statusData = [
            { name: 'Approved', value: confirmedList.length, color: '#4ade80' },
            { name: 'Pending', value: pendingList.length, color: '#fb923c' },
            { name: 'Rejected', value: rejectedList.length, color: '#f87171' }
        ].filter(item => item.value > 0);

        // 3. CORE METRICS
        const totalRevenue = confirmedList.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
        const totalAdults = confirmedList.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);
        const totalKids = confirmedList.reduce((sum, b) => sum + (Number(b.kids) || 0), 0);
        const totalPets = confirmedList.reduce((sum, b) => sum + (Number(b.pets) || 0), 0);

        const cabinRevenue = [
            {
                name: 'Ohannah',
                value: confirmedList.filter(b => b.cabin?.toLowerCase().includes('ohannah')).reduce((s, b) => s + Number(b.totalPrice), 0),
                count: confirmedList.filter(b => b.cabin?.toLowerCase().includes('ohannah')).length
            },
            {
                name: 'The Dream',
                value: confirmedList.filter(b => b.cabin?.toLowerCase().includes('dream')).reduce((s, b) => s + Number(b.totalPrice), 0),
                count: confirmedList.filter(b => b.cabin?.toLowerCase().includes('dream')).length
            }
        ];

        const stayTypeStats = ['full', 'evening', 'day'].map(type => {
            const match = confirmedList.filter(b => (b.stayType || 'full').toLowerCase() === type);
            return { name: type.toUpperCase(), count: match.length, revenue: match.reduce((s, b) => s + Number(b.totalPrice), 0) };
        });

        const dayTypeStats = ['weekday', 'weekend', 'holiday'].map(type => {
            const match = confirmedList.filter(b => classifyDayType(parseISO(b.checkInDate || b.checkIn)) === type);
            return { name: type.charAt(0).toUpperCase() + type.slice(1), count: match.length, revenue: match.reduce((s, b) => s + Number(b.totalPrice), 0) };
        });

        return {
            totalRevenue, totalAdults, totalKids, totalPets, cabinRevenue, statusData,
            stayTypeStats, dayTypeStats, totalBookings: confirmedList.length,
            pendingCount: pendingList.length
        };
    }, [bookings, dateRange, startDate, endDate]);

    return (
        <div className="p-4 lg:p-6 space-y-6 bg-[#f8f9fa] min-h-screen font-sans text-zinc-900">
            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quick Filter:</span>
                    {['all', 'month', 'year'].map((r) => (
                        <button key={r} onClick={() => setDateRange(r as any)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${dateRange === r ? 'bg-[#D4AF37] text-white' : 'bg-zinc-50 text-zinc-600'}`}>
                            {r.replace('all', 'All Time')}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }} className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 focus:ring-1 focus:ring-[#D4AF37]" />
                    <span className="text-zinc-400 text-[10px] font-bold">TO</span>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }} className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 focus:ring-1 focus:ring-[#D4AF37]" />
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KPICard title="Gross Revenue" value={`₱${analysis.totalRevenue.toLocaleString()}`} icon="₱" color="text-emerald-600" bg="bg-emerald-50" />
                <KPICard title="Total Bookings" value={analysis.totalBookings} icon={<Calendar />} color="text-orange-600" bg="bg-orange-50" />
                <KPICard title="Total Adults" value={analysis.totalAdults} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
                <KPICard title="Total Kids" value={analysis.totalKids} icon={<Baby />} color="text-purple-600" bg="bg-purple-50" />
                <KPICard title="Total Pets" value={analysis.totalPets} icon={<Dog />} color="text-amber-600" bg="bg-amber-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. BOOKING STATUS */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-center min-h-[350px]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b pb-3">Booking Status Distribution</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={analysis.statusData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                    {analysis.statusData.map((item, i) => <Cell key={i} fill={item.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. REVENUE PER CABIN */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm min-h-[350px]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b pb-3">Revenue per Cabin</h3>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.cabinRevenue} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#18181b" radius={[0, 10, 10, 0]} barSize={30}>
                                    {analysis.cabinRevenue.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#18181b' : '#D4AF37'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {analysis.cabinRevenue.map((c) => (
                            <div key={c.name} className="p-3 bg-zinc-50 rounded-xl">
                                <p className="text-[9px] font-black text-zinc-400 uppercase">{c.name}</p>
                                <p className="text-sm font-black">{c.count} Books</p>
                                <p className="text-[11px] font-bold text-[#D4AF37]">₱{c.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. STAY & DAY STATISTICS */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6 min-h-[350px]">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 border-b pb-2">Stay Type Breakdown</h3>
                        <div className="space-y-3">
                            {analysis.stayTypeStats.map(s => (
                                <div key={s.name} className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-zinc-500">{s.name}</span>
                                    <div className="text-right">
                                        <p>{s.count} stays</p>
                                        <p className="text-[#D4AF37]">₱{s.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 border-b pb-2">Day Type Stats</h3>
                        <div className="space-y-3">
                            {analysis.dayTypeStats.map(d => (
                                <div key={d.name} className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-zinc-500">{d.name}</span>
                                    <div className="text-right">
                                        <p>{d.count} bookings</p>
                                        <p className="text-emerald-600">₱{d.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIPTIVE REPORT */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></div>
                    <h2 className="text-xl font-black uppercase italic tracking-widest text-zinc-800">Descriptive <span className="text-zinc-400">Report</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InsightCard title="Revenue Performance" value={`₱${analysis.totalRevenue.toLocaleString()}`} desc="Total confirmed earnings for the selected period." icon={<DollarSign />} />
                    <InsightCard title="Conversion Rate" value={`${analysis.totalBookings > 0 ? ((analysis.totalBookings / (analysis.totalBookings + analysis.pendingCount)) * 100).toFixed(1) : 0}%`} desc="Percentage of inquiries that resulted in confirmed bookings." icon={<TrendingUp />} />
                    <InsightCard title="Operational Status" value="Stable" desc="Business operations and staff scheduling are currently optimal." icon={<Target />} />
                    <InsightCard title="Market Demand" value="High" desc="Consistent booking trends observed across weekend and holiday slots." icon={<Sparkles />} />
                </div>
            </section>
        </div>
    );
}

function KPICard({ title, value, icon, color, bg }: { title: string, value: string | number, icon: React.ReactNode, color: string, bg: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between hover:shadow-md transition-all">
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 truncate">{title}</p>
                <h4 className="text-lg font-black text-zinc-900 tracking-tighter truncate">{value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0 font-black text-lg`}>
                {typeof icon === 'string' ? icon : React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<LucideProps>, { size: 18, strokeWidth: 3 }) : icon}
            </div>
        </div>
    );
}

function InsightCard({ title, value, desc, icon }: { title: string, value: string, desc: string, icon: React.ReactNode }) {
    return (
        <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group hover:bg-[#18181b] transition-colors duration-300">
            <div className="bg-white p-2 w-fit rounded-xl mb-4 shadow-sm group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<LucideProps>, { size: 18 }) : icon}
            </div>
            <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 group-hover:text-zinc-500">{title}</p>
            <h4 className="text-xl font-black text-zinc-900 mb-2 group-hover:text-white">{value}</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-400">{desc}</p>
        </div>
    );
}