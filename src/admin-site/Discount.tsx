import React, { useEffect, useState } from "react";
import { db } from "../shared/lib/firebase";
import { doc, onSnapshot, setDoc, collection, query } from "firebase/firestore";
import { X, Plus, Tag, Trash2, Users, Search, AlertTriangle } from "lucide-react";

type DiscountType = "fixed" | "percent";

interface DiscountRule {
    id: string;
    code: string;
    description: string;
    type: DiscountType;
    value: number;
    active: boolean;
    minNights: number;
    allowedRecipients: string[];
}

const defaultDiscounts: DiscountRule[] = [
    {
        id: "welcome",
        code: "WELCOME5",
        description: "New guest launch discount",
        type: "percent",
        value: 5,
        active: true,
        minNights: 1,
        allowedRecipients: [],
    },
    {
        id: "extended",
        code: "STAYMORE",
        description: "Long stay savings",
        type: "fixed",
        value: 1000,
        active: false,
        minNights: 3,
        allowedRecipients: [],
    },
];

export default function DiscountManager() {
    const [discounts, setDiscounts] = useState<DiscountRule[]>(defaultDiscounts);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);

    // States para sa Filtering, User Restriction Modal, at Delete Confirmation
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModalDiscountId, setActiveModalDiscountId] = useState<string | null>(null);
    const [recipientDraft, setRecipientDraft] = useState("");
    const [discountToDelete, setDiscountToDelete] = useState<DiscountRule | null>(null);

    // 1. Listen sa Firestore Changes
    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(doc(db, "metadata", "discounts"), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (Array.isArray(data.discounts)) {
                setDiscounts(data.discounts.map((item: any, index: number) => ({
                    id: item.id || `discount-${index}`,
                    code: item.code || "",
                    description: item.description || "",
                    type: item.type === "fixed" ? "fixed" : "percent",
                    value: Number(item.value) || 0,
                    active: Boolean(item.active),
                    minNights: Number(item.minNights) || 1,
                    allowedRecipients: Array.isArray(item.allowedRecipients)
                        ? item.allowedRecipients.map((recipient: any) => String(recipient || "").trim()).filter(Boolean)
                        : [],
                })));
            }
        });

        return () => unsub();
    }, []);

    // 2. Listen sa Bookings for suggestions directory
    useEffect(() => {
        if (!db) return;
        const bookingsQuery = query(collection(db, "bookings"));
        const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
            setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribeBookings();
    }, []);

    // Helper to auto-sync back into Firestore whenever state mutates
    async function saveToFirestore(updatedDiscounts: DiscountRule[]) {
        if (!db) return;
        try {
            setStatusMessage("Syncing changes...");
            await setDoc(doc(db, "metadata", "discounts"), {
                discounts: updatedDiscounts,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
            setStatusMessage("Changes saved automatically.");
            setTimeout(() => setStatusMessage(null), 2500);
        } catch (err: any) {
            console.error("Auto-save error: ", err);
            setStatusMessage("Failed to auto-save changes.");
        }
    }

    // Combined email and names for selection suggestions
    const suggestedRecipients = React.useMemo(() => {
        const uniqueMap = new Map<string, string>();
        bookings.forEach((booking) => {
            const email = String(booking.userEmail || booking.email || "").trim();
            const name = String(booking.customerName || booking.fullName || "").trim();

            if (email && name) {
                const combinedFormat = `${email} - ${name}`;
                uniqueMap.set(combinedFormat.toLowerCase(), combinedFormat);
            } else if (email) {
                uniqueMap.set(email.toLowerCase(), email);
            } else if (name) {
                uniqueMap.set(name.toLowerCase(), name);
            }
        });
        return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
    }, [bookings]);

    // Live search computation filter
    const filteredDiscounts = React.useMemo(() => {
        return discounts.filter((discount) => {
            const matchCode = discount.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchDesc = discount.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCode || matchDesc;
        });
    }, [discounts, searchQuery]);

    const targetedDiscountForModal = discounts.find(d => d.id === activeModalDiscountId);

    function addRecipientsFromDraft(id: string, rawValue: string) {
        const values = String(rawValue)
            .split(/[,\n]/)
            .map((entry) => entry.trim())
            .filter(Boolean);

        if (!values.length) return;

        const updated = discounts.map((item) => {
            if (item.id !== id) return item;
            const combined = [...item.allowedRecipients, ...values];
            const unique = Array.from(new Set(combined.map((entry) => entry.trim()).filter(Boolean)));
            return { ...item, allowedRecipients: unique };
        });

        setDiscounts(updated);
        saveToFirestore(updated);
        setRecipientDraft("");
    }

    function removeRecipient(id: string, recipient: string) {
        const updated = discounts.map((item) => {
            if (item.id !== id) return item;
            return { ...item, allowedRecipients: item.allowedRecipients.filter((entry) => entry !== recipient) };
        });
        setDiscounts(updated);
        saveToFirestore(updated);
    }

    function updateDiscountField(id: string, field: keyof DiscountRule, value: string | number | boolean) {
        const updated = discounts.map((item) => {
            if (item.id !== id) return item;
            if (field === "value" || field === "minNights") {
                return { ...item, [field]: Number(value) };
            }
            return { ...item, [field]: value };
        });
        setDiscounts(updated);
        saveToFirestore(updated);
    }

    function addDiscount() {
        const nextPromo: DiscountRule = {
            id: `discount-${Date.now()}`,
            code: "NEWCODE",
            description: "New promotion",
            type: "percent",
            value: 10,
            active: false,
            minNights: 1,
            allowedRecipients: [],
        };
        const updated = [...discounts, nextPromo];
        setDiscounts(updated);
        saveToFirestore(updated);
    }

    function confirmAndRemoveDiscount() {
        if (!discountToDelete) return;
        const updated = discounts.filter((item) => item.id !== discountToDelete.id);
        setDiscounts(updated);
        saveToFirestore(updated);
        setDiscountToDelete(null);
    }

    return (
        <div className="p-8 max-w-7xl font-sans text-zinc-900 selection:bg-zinc-200">
            {/* Top Header Panel */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 border-b border-zinc-100 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-serif italic tracking-tight">Promotions & Discount Rules</h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Create codes, set thresholds, and control availability</p>
                </div>

                <div className="flex items-center gap-4">
                    {statusMessage && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg animate-pulse">
                            {statusMessage}
                        </div>
                    )}
                    <button
                        onClick={addDiscount}
                        className="flex items-center gap-2 px-5 py-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                    >
                        <Plus size={14} /> Add Discount
                    </button>
                </div>
            </div>

            {/* Omnibox Search Field Filter */}
            <div className="mb-6 relative max-w-md">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 pointer-events-none">
                    <Search size={16} />
                </span>
                <input
                    type="text"
                    placeholder="Search by code or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:border-zinc-900 outline-none text-xs font-medium placeholder:text-zinc-400 shadow-sm transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-900"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Main Cards Stack Grid */}
            <div className="grid gap-6">
                {filteredDiscounts.length > 0 ? (
                    filteredDiscounts.map((discount) => (
                        <div key={discount.id} className="bg-white p-6 rounded-[2.5rem] border border-zinc-200/60 shadow-sm hover:shadow-md/50 transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3 text-zinc-900">
                                    <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                                        <Tag size={18} />
                                    </span>
                                    <div>
                                        <div className="text-sm font-black tracking-[0.1em] text-zinc-800">{discount.code || "UNTITLED"}</div>
                                        <p className="text-xs text-zinc-400">{discount.description || "No description yet"}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDiscountToDelete(discount)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                                >
                                    <Trash2 size={13} /> Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Discount Code</label>
                                    <input
                                        type="text"
                                        value={discount.code}
                                        onChange={(e) => updateDiscountField(discount.id, "code", e.target.value.toUpperCase().trim())}
                                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={discount.description}
                                        onChange={(e) => updateDiscountField(discount.id, "description", e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Type</label>
                                    <select
                                        value={discount.type}
                                        onChange={(e) => updateDiscountField(discount.id, "type", e.target.value as DiscountType)}
                                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                    >
                                        <option value="percent">Percent</option>
                                        <option value="fixed">Fixed (PHP)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Value</label>
                                    <input
                                        type="number"
                                        value={discount.value}
                                        onChange={(e) => updateDiscountField(discount.id, "value", Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Min Nights</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={discount.minNights}
                                        onChange={(e) => updateDiscountField(discount.id, "minNights", Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                    />
                                </div>

                                <div className="flex flex-col justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveModalDiscountId(discount.id);
                                            setRecipientDraft("");
                                        }}
                                        className="w-full py-3 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-xs font-bold transition-colors border border-zinc-200/40 relative"
                                    >
                                        <Users size={14} />
                                        <span>Manage Users</span>
                                        {discount.allowedRecipients.length > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-zinc-900 text-white font-mono text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black">
                                                {discount.allowedRecipients.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 xl:col-span-6 flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-2 mt-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-black">Status</span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${discount.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-200/60 text-zinc-600"}`}>
                                            {discount.active ? "Active" : "Disabled"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => updateDiscountField(discount.id, "active", !discount.active)}
                                        className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors text-[10px] font-black uppercase tracking-[0.1em]"
                                    >
                                        {discount.active ? "Disable" : "Enable"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                        <p className="text-sm text-zinc-400 font-medium">No promotions found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* Allowed Recipients Modal */}
            {targetedDiscountForModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-zinc-100">
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                            <div>
                                <h3 className="text-lg font-serif italic text-zinc-900">Allowed Users Context</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Restricting coupon <span className="font-mono font-bold text-zinc-700">{targetedDiscountForModal.code}</span></p>
                            </div>
                            <button
                                onClick={() => setActiveModalDiscountId(null)}
                                className="w-8 h-8 rounded-full bg-zinc-200/70 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2">Add Authorized Recipients</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Type user email - name, then press Enter"
                                            value={recipientDraft}
                                            onChange={(e) => setRecipientDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === ",") {
                                                    e.preventDefault();
                                                    addRecipientsFromDraft(targetedDiscountForModal.id, recipientDraft);
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200 focus:border-zinc-900 outline-none text-xs font-bold"
                                        />

                                        {recipientDraft ? (
                                            <div className="absolute left-0 right-0 z-30 mt-2 max-h-48 overflow-y-auto rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl">
                                                <div className="px-2 py-1 mb-1 text-[9px] font-black uppercase tracking-wider text-zinc-400">Suggested Directory Profiles</div>
                                                <div className="space-y-1">
                                                    {suggestedRecipients
                                                        .filter((recipient) => recipient.toLowerCase().includes(recipientDraft.toLowerCase()) && !targetedDiscountForModal.allowedRecipients.includes(recipient))
                                                        .slice(0, 8)
                                                        .map((recipient) => (
                                                            <button
                                                                key={recipient}
                                                                type="button"
                                                                onClick={() => addRecipientsFromDraft(targetedDiscountForModal.id, recipient)}
                                                                className="w-full text-left rounded-xl px-3 py-2 text-zinc-700 text-xs hover:bg-zinc-50 font-medium transition-colors"
                                                            >
                                                                {recipient}
                                                            </button>
                                                        ))}
                                                    {!suggestedRecipients.some((recipient) => recipient.toLowerCase().includes(recipientDraft.toLowerCase()) && !targetedDiscountForModal.allowedRecipients.includes(recipient)) && (
                                                        <div className="px-3 py-2 text-xs text-zinc-400 italic">No matches discovered in bookings logs.</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addRecipientsFromDraft(targetedDiscountForModal.id, recipientDraft)}
                                        className="px-4 py-3 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-colors shrink-0"
                                    >
                                        Add
                                    </button>
                                </div>
                                <p className="mt-2 text-[9px] text-zinc-400 uppercase tracking-widest"> Leave entirely empty to make public.</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-3">Currently Bound Users ({targetedDiscountForModal.allowedRecipients.length})</label>
                                {targetedDiscountForModal.allowedRecipients.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto bg-zinc-50/50 rounded-2xl border border-zinc-100 p-3">
                                        {targetedDiscountForModal.allowedRecipients.map((recipient) => (
                                            <span key={recipient} className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm">
                                                {recipient}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecipient(targetedDiscountForModal.id, recipient)}
                                                    className="w-4 h-4 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors text-[10px]"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-xs text-zinc-400 font-medium">
                                        This coupon is public. Anyone can apply this promo code.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveModalDiscountId(null)}
                                className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-colors"
                            >
                                Close & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Are You Sure? Remove Confirmation Modal Overlay */}
            {discountToDelete && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-100 p-6 space-y-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-serif italic text-zinc-900">Remove Promotion Rule?</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Are you sure you want to permanently delete the promotion code <span className="font-mono font-bold text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded">{discountToDelete.code}</span>? This structural change cannot be undone.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDiscountToDelete(null)}
                                className="w-full py-3 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors text-xs font-black uppercase tracking-wider rounded-xl border border-zinc-200/40"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAndRemoveDiscount}
                                className="w-full py-3 bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-black uppercase tracking-wider rounded-xl shadow-sm shadow-rose-200"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}