import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, Firestore } from "firebase/firestore";
import { Inbox, Calendar, TrendingUp } from "lucide-react";
import { db } from "../shared/lib/firebase";
import { Reservations } from "./Reservations";

export default function AdminApp() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db as Firestore, "bookings", id), { status });
    } catch (e) { console.error(e); }
  };

  const deleteBooking = async (id: string) => {
    if (!db || !window.confirm("Burahin na ba talaga?")) return;
    try { await deleteDoc(doc(db as Firestore, "bookings", id)); } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-zinc-950 p-8 flex flex-col gap-8 text-white sticky top-0 h-screen shrink-0">
        <h1 className="text-xl font-serif italic px-4">Ohannah <span className="text-[#D4AF37]">Admin</span></h1>
        <nav className="space-y-2">
          <NavItem icon={<Inbox size={18} />} label="Bookings" active />
          <NavItem icon={<Calendar size={18} />} label="Calendar" />
          <NavItem icon={<TrendingUp size={18} />} label="Analytics" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-serif italic font-black">Reservations</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Dashboard</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-[#D4AF37] animate-pulse font-black text-xs tracking-widest">LOADING...</div>
        ) : (
          <Reservations
            bookings={bookings}
            onStatusUpdate={updateStatus}
            onDelete={deleteBooking}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-[#D4AF37] text-white shadow-xl shadow-[#D4AF37]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
      {icon} <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}