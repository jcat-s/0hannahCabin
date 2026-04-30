import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, Firestore } from "firebase/firestore";
import { Inbox, Calendar, TrendingUp } from "lucide-react";
import { db } from "../shared/lib/firebase";
import { Reservations } from "./Reservations";
import { Analytics } from "./Analytics";

export default function AdminApp() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'analytics'>('bookings');

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

  const updateStatus = async (id: string, status: string, message?: string) => {
    if (!db) return;
    try {
      const updateData: any = { status };
      if (message) updateData.statusMessage = message;
      await updateDoc(doc(db as Firestore, "bookings", id), updateData);
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
          <NavItem icon={<Inbox size={18} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <NavItem icon={<Calendar size={18} />} label="Calendar" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <NavItem icon={<TrendingUp size={18} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-serif italic font-black">
            {activeTab === 'bookings' ? 'Reservations' :
             activeTab === 'calendar' ? 'Calendar' : 'Analytics'}
          </h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            {activeTab === 'bookings' ? 'Dashboard' :
             activeTab === 'calendar' ? 'Booking Overview' : 'Business Insights'}
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-[#D4AF37] animate-pulse font-black text-xs tracking-widest">LOADING...</div>
        ) : (
          <>
            {activeTab === 'bookings' && (
              <Reservations
                bookings={bookings}
                onStatusUpdate={updateStatus}
                onDelete={deleteBooking}
              />
            )}
            {activeTab === 'calendar' && (
              <div className="text-center py-20">
                <Calendar size={48} className="mx-auto text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-black uppercase tracking-widest">Calendar View Coming Soon</p>
              </div>
            )}
            {activeTab === 'analytics' && (
              <Analytics bookings={bookings} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-[#D4AF37] text-white shadow-xl shadow-[#D4AF37]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
      {icon} <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}