import React, { useMemo, useState } from 'react';
import { Users, Baby, Dog, Calendar, LucideProps } from "lucide-react";
import { format, parseISO, getDay, isWithinInterval } from 'date-fns';

// Import separated components
import { Descriptive } from './Analytics/Descriptive';
import { Predictive } from './Analytics/Predictive';
import { Prescriptive } from './Analytics/Prescriptive';

const FIXED_PH_HOLIDAYS = ["01-01", "04-09", "05-01", "06-12", "08-31", "11-30", "12-25", "12-30", "02-17", "08-21", "11-01", "11-02", "12-08", "12-24", "12-31"];

const classifyDayType = (date: Date, dbHolidays: string[] = []): 'weekday' | 'weekend' | 'holiday' => {
    const day = getDay(date);
    const monthDay = format(date, "MM-dd");
    const fullDate = format(date, "yyyy-MM-dd");
    if (FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate)) return 'holiday';
    // Friday (5), Saturday (6), Sunday (0) are weekends
    if (day === 0 || day === 6 || day === 5) return 'weekend';
    return 'weekday';
};

export function Analytics({ bookings }: { bookings: any[] }) {
    const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const analysis = useMemo(() => {
        // 1. Filter by Date Range
        const filteredByRange = bookings.filter(b => {
            const checkInDate = parseISO(b.checkInDate || b.checkIn);
            if (dateRange === 'custom' && startDate && endDate) {
                return isWithinInterval(checkInDate, { start: parseISO(startDate), end: parseISO(endDate) });
            }
            if (dateRange === 'month') return checkInDate.getMonth() === new Date().getMonth();
            if (dateRange === 'year') return checkInDate.getFullYear() === new Date().getFullYear();
            return true;
        });

        // 2. Filter by Status
        const confirmedList = filteredByRange.filter(b => b.status === 'Confirmed' || b.status === 'Approved');
        const pendingList = filteredByRange.filter(b => b.status === 'Pending');
        const rejectedList = filteredByRange.filter(b => b.status === 'Rejected' || b.status === 'Cancelled');

        // 3. Status Distribution (para sa unang Pie Chart)
        const statusData = [
            { name: 'Approved', value: confirmedList.length, color: '#4ade80' },
            { name: 'Pending', value: pendingList.length, color: '#fb923c' },
            { name: 'Rejected', value: rejectedList.length, color: '#f87171' }
        ].filter(i => i.value >= 0); // Wag i-filter para laging may label kahit 0

        // 4. Revenue per Cabin (para sa pangalawang Pie Chart)
        const cabinRevenue = [
            {
                name: 'Ohannah',
                value: confirmedList.filter(b => b.cabin?.toLowerCase().includes('ohannah')).reduce((s, b) => s + Number(b.totalPrice || 0), 0),
                count: confirmedList.filter(b => b.cabin?.toLowerCase().includes('ohannah')).length
            },
            {
                name: 'The Dream',
                value: confirmedList.filter(b => b.cabin?.toLowerCase().includes('dream')).reduce((s, b) => s + Number(b.totalPrice || 0), 0),
                count: confirmedList.filter(b => b.cabin?.toLowerCase().includes('dream')).length
            }
        ];

        // 5. Stay Type Breakdown (para sa listahan sa dulo)
        const stayTypeStats = ['full', 'evening', 'day'].map(type => {
            const matches = confirmedList.filter(b => (b.stayType || 'full').toLowerCase() === type);
            return {
                name: type.toUpperCase(),
                count: matches.length,
                revenue: matches.reduce((s, b) => s + Number(b.totalPrice || 0), 0)
            };
        });

        // 6. Day Type Stats
        const dayTypeStats = ['weekday', 'weekend', 'holiday'].map(type => {
            const matches = confirmedList.filter(b => classifyDayType(parseISO(b.checkInDate || b.checkIn)) === type);
            return {
                name: type.charAt(0).toUpperCase() + type.slice(1),
                count: matches.length,
                revenue: matches.reduce((s, b) => s + Number(b.totalPrice || 0), 0)
            };
        });

        const totalRevenue = confirmedList.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

        return {
            totalRevenue,
            totalAdults: confirmedList.reduce((sum, b) => sum + (Number(b.guests) || 0), 0),
            totalKids: confirmedList.reduce((sum, b) => sum + (Number(b.kids) || 0), 0),
            totalPets: confirmedList.reduce((sum, b) => sum + (Number(b.pets) || 0), 0),
            totalBookings: confirmedList.length,
            confirmedList,
            statusData,
            cabinRevenue,
            stayTypeStats, // Ipinapasa na may 's' para match sa interface
            dayTypeStats,
            pendingCount: pendingList.length
        };
    }, [bookings, dateRange, startDate, endDate]);

    return (
        <div className="p-4 lg:p-6 space-y-8 bg-[#f8f9fa] min-h-screen font-sans text-zinc-900">
            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quick Filter:</span>
                    {['all', 'month', 'year'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setDateRange(r as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${dateRange === r ? 'bg-[#D4AF37] text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                        >
                            {r === 'all' ? 'All Time' : r}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }} className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    <span className="text-zinc-400 text-[10px] font-bold">TO</span>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }} className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
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

            {/* THE BIG THREE SECTIONS */}
            <div className="space-y-20 pt-10">
                {/* 1. DESCRIPTIVE (Yung main report na inayos natin) */}
                <section>
                    <Descriptive analysis={analysis} />
                </section>

                {/* 2. PREDICTIVE (Data-driven forecasting) */}
                <section className="pt-10 border-t border-zinc-200">
                    <Predictive bookings={analysis.confirmedList} />
                </section>

                {/* 3. PRESCRIPTIVE (Business Recommendations) */}
                <section className="pt-10 border-t border-zinc-200">
                    <Prescriptive
                        revenueData={analysis.cabinRevenue}
                        dayStats={analysis.dayTypeStats}
                    />
                </section>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, color, bg }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between hover:scale-[1.02] transition-all">
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">{title}</p>
                <h4 className="text-lg font-black text-zinc-900 tracking-tighter">{value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0 font-black text-lg`}>
                {typeof icon === 'string' ? icon : React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<LucideProps>, { size: 18, strokeWidth: 3 }) : icon}
            </div>
        </div>
    );
}