import React from "react";
import { AuthProvider } from "../shared/context/AuthContext";
import { NotificationProvider } from "../shared/context/NotificationContext";

const MOCK_RESERVATIONS = [
  {
    id: "RES-001",
    guestName: "Juan Dela Cruz",
    cabin: "Ohannah Cabin",
    stayType: "Full Stay",
    checkIn: "2026-03-18",
    checkOut: "2026-03-20",
    status: "Confirmed",
    amount: 12000,
  },
  {
    id: "RES-002",
    guestName: "Maria Santos",
    cabin: "The Dream by Ohannah",
    stayType: "Day Lounge",
    checkIn: "2026-03-22",
    checkOut: "2026-03-22",
    status: "Pending",
    amount: 7000,
  },
  {
    id: "RES-003",
    guestName: "Family Reyes",
    cabin: "Ohannah Cabin",
    stayType: "Evening Chill",
    checkIn: "2026-03-25",
    checkOut: "2026-03-26",
    status: "Cancelled",
    amount: 0,
  },
];

function AdminDashboard() {
  const totalReservations = MOCK_RESERVATIONS.length;
  const confirmed = MOCK_RESERVATIONS.filter((r) => r.status === "Confirmed").length;
  const cancelled = MOCK_RESERVATIONS.filter((r) => r.status === "Cancelled").length;
  const totalRevenue = MOCK_RESERVATIONS.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="min-h-screen bg-neutral-100 text-stone-900">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            Ohannah Cabin – Admin
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            System for Resort Management – bookings, analytics, guests
          </p>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-stone-900 text-white font-bold uppercase tracking-widest">
          Admin Dashboard
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* High-level metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Reservations" value={totalReservations.toString()} />
          <StatCard label="Confirmed" value={confirmed.toString()} />
          <StatCard label="Cancelled" value={cancelled.toString()} />
          <StatCard label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} />
        </section>

        {/* Reservations table */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-stone-50">
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-stone-700">
                Reservations
              </h2>
              <p className="text-xs text-stone-400">
                Track guest bookings, status, and schedules.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-100 text-[11px] uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Ref #
                  </th>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Cabin
                  </th>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Stay
                  </th>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Check-out
                  </th>
                  <th className="px-4 py-3 text-left font-bold tracking-widest">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-bold tracking-widest">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {MOCK_RESERVATIONS.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">
                      {r.id}
                    </td>
                    <td className="px-4 py-3 font-semibold">{r.guestName}</td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      {r.cabin}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      {r.stayType}
                    </td>
                    <td className="px-4 py-3 text-xs">{r.checkIn}</td>
                    <td className="px-4 py-3 text-xs">{r.checkOut}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {r.amount ? `₱${r.amount.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notes / roadmap */}
        <section className="bg-stone-900 text-white rounded-3xl p-6 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest">
            Roadmap – System for Resort Management
          </h3>
          <ul className="text-xs space-y-1 text-stone-200">
            <li>1.1 / 1.2 – Centralized booking + admin dashboard (this screen)</li>
            <li>1.3 – Integrate real payments (Stripe, PayMongo, etc.)</li>
            <li>1.4 / 1.5 / 4.x – Real-time calendar + analytics reports</li>
            <li>2.x – Guest accounts, history, self-service modify/cancel</li>
            <li>3.x – Messaging, FAQs, automated notifications</li>
            <li>5.x – Harden security, roles, and privacy settings</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black tracking-tight text-stone-900">
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest";
  if (status === "Confirmed") {
    return (
      <span className={`${base} bg-emerald-100 text-emerald-700`}>
        Confirmed
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className={`${base} bg-amber-100 text-amber-700`}>Pending</span>
    );
  }
  if (status === "Cancelled") {
    return (
      <span className={`${base} bg-rose-100 text-rose-700`}>Cancelled</span>
    );
  }
  return <span className={base}>{status}</span>;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AdminDashboard />
      </NotificationProvider>
    </AuthProvider>
  );
}

