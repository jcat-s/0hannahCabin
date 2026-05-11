import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, Firestore } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  Inbox, Calendar, TrendingUp, LogOut, Settings,
  UserCircle, X, AlertTriangle, Search
} from "lucide-react";
import { db, auth } from "../shared/lib/firebase";
import { Reservations } from "./Reservations";
import { Analytics } from "./Analytics";
import { CalendarView } from "./Calendar";

export default function AdminApp() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'analytics'>('bookings');

  // States para sa Modals at Logic
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!db) return;
    // Real-time listener para sa bookings
    const q = query(collection(db as Firestore, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  const updateStatus = async (id: string, status: string, message?: string) => {
    if (!db) return;
    try {
      const updateData: any = { status };
      if (message) updateData.statusMessage = message;
      await updateDoc(doc(db as Firestore, "bookings", id), updateData);
    } catch (e) {
      console.error("Update Error:", e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!db || !window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDoc(doc(db as Firestore, "bookings", id));
    } catch (e) {
      console.error("Delete Error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-zinc-950 p-8 flex flex-col text-white sticky top-0 h-screen shrink-0 border-r border-white/5">
        <div className="mb-12 px-4">
          <h1 className="text-xl font-serif italic tracking-tight">
            Ohannah Cabin <span className="text-[#D4AF37] font-black not-italic ml-1">Admin</span>
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem
            icon={<Inbox size={18} />}
            label="Bookings"
            active={activeTab === 'bookings'}
            onClick={() => setActiveTab('bookings')}
          />
          <NavItem
            icon={<Calendar size={18} />}
            label="Calendar"
            active={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
          />
          <NavItem
            icon={<TrendingUp size={18} />}
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />

          <div className="pt-8 mt-8 border-t border-white/5 opacity-50">
            <p className="px-6 text-[8px] font-black uppercase tracking-[0.4em] mb-4 text-zinc-500">System</p>
            <NavItem icon={<Settings size={18} />} label="Settings" active={false} onClick={() => { }} />
          </div>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#D4AF37] border border-white/5">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest truncate">Admin User</p>
              <p className="text-[8px] text-zinc-500 font-bold truncate italic">admin@ohannah.com</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-serif italic font-black tracking-tighter">
              {activeTab === 'bookings' ? 'Bookings' :
                activeTab === 'calendar' ? 'Calendar' : 'Analytics'}
            </h2>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">
              {activeTab === 'bookings' ? 'Reservation Management' :
                activeTab === 'calendar' ? 'Booking Overview' : 'Business Insights'}
            </p>
          </div>

          {/* Quick Stats or Current Date can go here */}
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">System Status</p>
            <p className="text-[11px] font-bold text-emerald-500 uppercase flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live & Encrypted
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
            <span className="text-[#D4AF37] font-black text-[10px] tracking-[0.5em] uppercase">Synchronizing Data...</span>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'bookings' && (
              <Reservations
                bookings={bookings}
                onStatusUpdate={updateStatus}
                onDelete={deleteBooking}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView bookings={bookings} />
            )}
            {activeTab === 'analytics' && (
              <Analytics bookings={bookings} />
            )}
          </div>
        )}
      </main>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-2xl text-center border border-zinc-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertTriangle size={40} />
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 leading-none">
              Sign Out?
            </h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-4 leading-relaxed px-4">
              Your session will be ended. You'll need to log back in to manage Ohannah Cabin.
            </p>

            <div className="flex flex-col gap-3 mt-10">
              <button
                onClick={handleLogout}
                className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-5 bg-zinc-50 text-zinc-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-100 transition-all active:scale-95"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar Navigation Item Component
function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active
          ? 'bg-[#D4AF37] text-zinc-950 shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
          : 'text-zinc-500 hover:text-white hover:bg-white/5'
        }`}
    >
      <span className={`${active ? 'text-zinc-950' : 'group-hover:text-[#D4AF37]'} transition-colors`}>
        {icon}
      </span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}