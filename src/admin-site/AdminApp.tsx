import React, { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "../shared/context/AuthContext";
import { NotificationProvider } from "../shared/context/NotificationContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../shared/lib/firebase";

type BookingStatus = "Pending" | "Confirmed" | "Cancelled";

interface BookingRecord {
  id: string;
  userEmail: string | null;
  cabin: string;
  stayType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pets: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: Date | null;
}

function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    if (!db) return;

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const next: BookingRecord[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          userEmail: data.userEmail ?? null,
          cabin: data.cabin,
          stayType: data.stayType,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          pets: data.pets,
          totalPrice: data.totalPrice ?? 0,
          status: (data.status as BookingStatus) ?? "Pending",
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });
      setBookings(next);
    });

    return () => unsub();
  }, []);

  const { totalReservations, confirmed, cancelled, totalRevenue } = useMemo(() => {
    const totalReservations = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

    return { totalReservations, confirmed, cancelled, totalRevenue };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-stone-900">
      <header className="border-b bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-stone-400">
            Ohannah Cabin
          </p>
          <h1 className="text-xl font-black tracking-tight">
            System for Resort Management
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Reservations, availability, and performance in one place.
          </p>
        </div>
        <span className="text-[11px] px-4 py-1.5 rounded-full bg-stone-900 text-white font-bold uppercase tracking-[0.2em]">
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
            <p className="text-[11px] text-stone-400 uppercase tracking-[0.2em]">
              Live from booking requests
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-100 text-[11px] uppercase text-stone-500">
                <tr>
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
                    Pax
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
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {b.userEmail ?? "Guest"}
                        </span>
                        {b.createdAt && (
                          <span className="text-[11px] text-stone-400">
                            {b.createdAt.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600 uppercase font-semibold">
                      {b.cabin}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600 uppercase">
                      {b.stayType}
                    </td>
                    <td className="px-4 py-3 text-xs">{b.checkIn}</td>
                    <td className="px-4 py-3 text-xs">{b.checkOut}</td>
                    <td className="px-4 py-3 text-xs">
                      {b.guests} pax{b.pets ? `, ${b.pets} pets` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {b.totalPrice ? `₱${b.totalPrice.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-stone-400"
                    >
                      No bookings yet. Guest requests will appear here once they
                      submit the booking form.
                    </td>
                  </tr>
                )}
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
            <li>1.1 / 1.2 – Centralized booking + admin dashboard (live data)</li>
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

function StatusPill({ status }: { status: BookingStatus }) {
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

