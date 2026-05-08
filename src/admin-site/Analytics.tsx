import React, { useMemo, useState } from 'react';
import { Users, Baby, Dog, LucideProps, TrendingUp } from "lucide-react";
import { format, parseISO, getDay, isWithinInterval, subMonths, isSameMonth } from 'date-fns';

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

        const confirmedList = filteredByRange.filter(b => b.status === 'Confirmed' || b.status === 'Approved');
        const pendingList = filteredByRange.filter(b => b.status === 'Pending');
        const rejectedList = filteredByRange.filter(b => b.status === 'Rejected' || b.status === 'Cancelled');

        // 2. Revenue per Cabin
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

        // 3. Stay Type Breakdown (Fixes the TS Error 2741)
        const stayTypeStats = ['full', 'evening', 'day'].map(type => {
            const matches = confirmedList.filter(b => (b.stayType || 'full').toLowerCase() === type);
            return {
                name: type.toUpperCase(),
                count: matches.length,
                revenue: matches.reduce((s, b) => s + Number(b.totalPrice || 0), 0)
            };
        });

        // 4. Day Type Stats
        const dayTypeStats = ['weekday', 'weekend', 'holiday'].map(type => {
            const matches = confirmedList.filter(b => classifyDayType(parseISO(b.checkInDate || b.checkIn)) === type);
            return {
                name: type.charAt(0).toUpperCase() + type.slice(1),
                count: matches.length,
                revenue: matches.reduce((s, b) => s + Number(b.totalPrice || 0), 0)
            };
        });

        // 5. Growth Rate Calculation
        const now = new Date();
        const currentMonthBookings = bookings.filter(b => isSameMonth(parseISO(b.checkInDate || b.checkIn), now));
        const lastMonthBookings = bookings.filter(b => isSameMonth(parseISO(b.checkInDate || b.checkIn), subMonths(now, 1)));

        const currentRev = currentMonthBookings.reduce((s, b) => s + Number(b.totalPrice || 0), 0);
        const lastRev = lastMonthBookings.reduce((s, b) => s + Number(b.totalPrice || 0), 0);
        const growthRate = lastRev > 0 ? ((currentRev - lastRev) / lastRev) * 100 : 0;

        return {
            totalRevenue: confirmedList.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
            totalAdults: confirmedList.reduce((sum, b) => sum + (Number(b.adults || b.guests || 0)), 0),
            totalKids: confirmedList.reduce((sum, b) => sum + (Number(b.children || b.kids || 0)), 0),
            totalPets: confirmedList.reduce((sum, b) => sum + (Number(b.pets || 0)), 0),
            totalBookings: confirmedList.length,
            confirmedList,
            cabinRevenue,
            stayTypeStats,
            dayTypeStats,
            growthRate,
            statusData: [
                { name: 'Approved', value: confirmedList.length, color: '#D4AF37' },
                { name: 'Pending', value: pendingList.length, color: '#18181b' },
                { name: 'Rejected', value: rejectedList.length, color: '#ef4444' }
            ]
        };
    }, [bookings, dateRange, startDate, endDate]);

    return (
        <div className="p-4 lg:p-6 space-y-8 bg-[#f8f9fa] min-h-screen font-sans text-zinc-900">

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 p-5 bg-white rounded-[2rem] border border-zinc-100 shadow-sm justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap text-left">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quick Filter:</span>
                    {['all', 'month', 'year'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setDateRange(r as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${dateRange === r ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                        >
                            {r === 'all' ? 'All Time' : r}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }} className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    <span className="text-zinc-400 text-[10px] font-bold uppercase">To</span>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }} className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KPICard title="Total Adults" value={analysis.totalAdults} icon={<Users />} color="text-zinc-900" bg="bg-zinc-50" />
                <KPICard title="Total Kids" value={analysis.totalKids} icon={<Baby />} color="text-zinc-900" bg="bg-zinc-50" />
                <KPICard title="Total Pets" value={analysis.totalPets} icon={<Dog />} color="text-zinc-900" bg="bg-zinc-50" />
            </div>

            {/* ANALYTICS SUITE */}
            <div className="space-y-24 pt-10">
                {/* 1. DESCRIPTIVE (Historical Data) */}
                <section>
                    <Descriptive analysis={analysis} />
                </section>

                {/* 2. PREDICTIVE (Forecasting) */}
                <section className="pt-16 border-t border-zinc-200">
                    <Predictive bookings={analysis.confirmedList} />
                </section>

                {/* 3. PRESCRIPTIVE (Strategy) */}
                <section className="pt-16 border-t border-zinc-200">
                    <Prescriptive
                        analysis={{
                            revenueData: analysis.cabinRevenue,
                            dayStats: analysis.dayTypeStats,
                            growthRate: analysis.growthRate,
                            occupancyRate: (analysis.totalBookings / 30) * 100
                        }}
                    />
                </section>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex items-center justify-between hover:border-[#D4AF37] transition-all group">
            <div className="min-w-0 text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-zinc-900 tracking-tighter">{value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors shadow-sm`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<LucideProps>, { size: 20, strokeWidth: 2.5 }) : icon}
            </div>
        </div>
    );
}