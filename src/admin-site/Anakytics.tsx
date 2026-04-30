import React, { useMemo } from "react";
import {
    TrendingUp, Users, Calendar, DollarSign,
    CheckCircle, Clock, XCircle, BarChart3,
    PieChart, Activity, Target
} from "lucide-react";

interface AnalyticsProps {
    bookings: any[];
}

export function Analytics({ bookings }: AnalyticsProps) {
    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
        const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
        const rejectedBookings = bookings.filter(b => b.status === 'Rejected').length;

        const totalRevenue = bookings
            .filter(b => b.status === 'Confirmed')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        const avgBookingValue = confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0;

        // Monthly revenue for the last 6 months
        const monthlyRevenue = {};
        bookings
            .filter(b => b.status === 'Confirmed' && b.createdAt)
            .forEach(booking => {
                const date = new Date(booking.createdAt.seconds * 1000);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (booking.totalPrice || 0);
            });

        // Stay type distribution
        const stayTypes = {};
        bookings.forEach(booking => {
            const type = booking.stayType || 'Unknown';
            stayTypes[type] = (stayTypes[type] || 0) + 1;
        });

        // Cabin distribution
        const cabins = {};
        bookings.forEach(booking => {
            const cabin = booking.cabin || 'Unknown';
            cabins[cabin] = (cabins[cabin] || 0) + 1;
        });

        return {
            totalBookings,
            confirmedBookings,
            pendingBookings,
            rejectedBookings,
            totalRevenue,
            avgBookingValue,
            monthlyRevenue,
            stayTypes,
            cabins,
            confirmationRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
        };
    }, [bookings]);

    const StatCard = ({ icon, title, value, subtitle, color = "text-[#D4AF37]" }: any) => (
        <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-zinc-50 ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
                    <p className="text-2xl font-black text-zinc-900">{value}</p>
                </div>
            </div>
            {subtitle && <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{subtitle}</p>}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-4xl font-serif italic font-black text-zinc-900">Analytics Dashboard</h2>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
                    Business Insights & Performance
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<BarChart3 size={24} />}
                    title="Total Bookings"
                    value={stats.totalBookings}
                    subtitle="All time"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    title="Confirmed"
                    value={stats.confirmedBookings}
                    subtitle={`${stats.confirmationRate.toFixed(1)}% approval rate`}
                    color="text-emerald-500"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    title="Pending"
                    value={stats.pendingBookings}
                    subtitle="Awaiting approval"
                    color="text-orange-500"
                />
                <StatCard
                    icon={<DollarSign size={24} />}
                    title="Total Revenue"
                    value={`₱${stats.totalRevenue.toLocaleString()}`}
                    subtitle={`Avg: ₱${stats.avgBookingValue.toLocaleString()}`}
                    color="text-green-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Stay Type Distribution */}
                <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <PieChart size={20} className="text-[#D4AF37]" />
                        <h3 className="text-lg font-black uppercase tracking-tight">Stay Types</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(stats.stayTypes).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-700 uppercase">{type}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-20 bg-zinc-100 rounded-full h-2">
                                        <div
                                            className="bg-[#D4AF37] h-2 rounded-full"
                                            style={{ width: `${(count / stats.totalBookings) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-black text-zinc-900 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cabin Distribution */}
                <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Target size={20} className="text-[#D4AF37]" />
                        <h3 className="text-lg font-black uppercase tracking-tight">Cabin Popularity</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(stats.cabins).map(([cabin, count]) => (
                            <div key={cabin} className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-700 uppercase">
                                    {cabin === 'ohannah' ? 'Ohannah Cabin' : cabin === 'dream' ? 'The Dream' : cabin}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-20 bg-zinc-100 rounded-full h-2">
                                        <div
                                            className="bg-[#D4AF37] h-2 rounded-full"
                                            style={{ width: `${(count / stats.totalBookings) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-black text-zinc-900 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Activity size={20} className="text-[#D4AF37]" />
                    <h3 className="text-lg font-black uppercase tracking-tight">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                    {bookings.slice(0, 10).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-b-0">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                                    booking.status === 'Confirmed' ? 'bg-emerald-500' :
                                    booking.status === 'Rejected' ? 'bg-red-500' : 'bg-orange-500'
                                }`}>
                                    {booking.status === 'Confirmed' ? '✓' :
                                     booking.status === 'Rejected' ? '✗' : '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">{booking.customerName}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                        {booking.checkIn} — {booking.checkOut} • {booking.stayType}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-zinc-900">₱{booking.totalPrice?.toLocaleString()}</p>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">
                                    {booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}