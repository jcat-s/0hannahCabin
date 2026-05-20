import React, { useEffect, useState } from "react";
import { db } from "../shared/lib/firebase";
import { collection, doc, onSnapshot, query, setDoc } from "firebase/firestore";
import { X, Plus, Tag, Save, Trash2 } from "lucide-react";

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
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [recipientDrafts, setRecipientDrafts] = useState<Record<string, string>>({});

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

    useEffect(() => {
        if (!db) return;
        const bookingsQuery = query(collection(db, "bookings"));
        const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
            setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribeBookings();
    }, []);

    const suggestedRecipients = React.useMemo(() => {
        const uniqueMap = new Map<string, string>();
        bookings.forEach((booking) => {
            const email = String(booking.userEmail || booking.email || "").trim();
            const name = String(booking.customerName || booking.fullName || "").trim();
            if (email) {
                const key = email.toLowerCase();
                if (!uniqueMap.has(key)) uniqueMap.set(key, email);
            }
            if (name) {
                const key = name.toLowerCase();
                if (!uniqueMap.has(key)) uniqueMap.set(key, name);
            }
        });
        return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
    }, [bookings]);

    function handleRecipientDraftChange(id: string, value: string) {
        setRecipientDrafts((prev) => ({ ...prev, [id]: value }));
    }

    function addRecipientsFromDraft(id: string, rawValue: string) {
        const values = String(rawValue)
            .split(/[,\n]/)
            .map((entry) => entry.trim())
            .filter(Boolean);

        if (!values.length) return;

        setDiscounts((prev) => prev.map((item) => {
            if (item.id !== id) return item;
            const combined = [...item.allowedRecipients, ...values];
            const unique = Array.from(new Set(combined.map((entry) => entry.trim()).filter(Boolean)));
            return { ...item, allowedRecipients: unique };
        }));

        setRecipientDrafts((prev) => ({ ...prev, [id]: "" }));
    }

    function toggleSuggestedRecipient(id: string, recipient: string) {
        setDiscounts((prev) => prev.map((item) => {
            if (item.id !== id) return item;
            const normalized = recipient.trim();
            if (!normalized) return item;
            const existing = item.allowedRecipients.includes(normalized);
            const nextRecipients = existing
                ? item.allowedRecipients.filter((entry) => entry !== normalized)
                : [...item.allowedRecipients, normalized];
            return { ...item, allowedRecipients: nextRecipients };
        }));
    }

    function removeRecipient(id: string, recipient: string) {
        setDiscounts((prev) => prev.map((item) => {
            if (item.id !== id) return item;
            return { ...item, allowedRecipients: item.allowedRecipients.filter((entry) => entry !== recipient) };
        }));
    }

    function updateDiscountField(id: string, field: keyof DiscountRule, value: string | number | boolean) {
        setDiscounts((prev) => prev.map((item) => {
            if (item.id !== id) return item;
            if (field === "value" || field === "minNights") {
                return { ...item, [field]: Number(value) };
            }
            if (field === "allowedRecipients") {
                const recipients = String(value)
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter(Boolean);
                return { ...item, allowedRecipients: recipients };
            }
            return { ...item, [field]: value };
        }));
    }

    function addDiscount() {
        setDiscounts((prev) => [
            ...prev,
            {
                id: `discount-${Date.now()}`,
                code: "NEWCODE",
                description: "New promotion",
                type: "percent",
                value: 10,
                active: false,
                minNights: 1,
                allowedRecipients: [],
            },
        ]);
    }

    function removeDiscount(id: string) {
        setDiscounts((prev) => prev.filter((item) => item.id !== id));
    }

    async function handleSave() {
        if (!db) {
            alert("Database connection context is not active.");
            return;
        }

        setSaving(true);
        try {
            await setDoc(doc(db, "metadata", "discounts"), {
                discounts,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
            setStatusMessage("Discount rules successfully updated.");
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err: any) {
            console.error(err);
            setStatusMessage(`Failed to save: ${err?.message || err}`);
            setTimeout(() => setStatusMessage(null), 5000);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-8 max-w-7xl font-sans text-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-zinc-100 pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-serif italic tracking-tight">Promotions & Discount Rules</h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Create codes, set thresholds, and control availability</p>
                </div>
                <button
                    onClick={addDiscount}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                    <Plus size={14} /> Add Discount
                </button>
            </div>

            <div className="grid gap-6">
                {discounts.map((discount) => (
                    <div key={discount.id} className="bg-white p-6 rounded-[2.5rem] border border-zinc-200/60 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 text-zinc-900">
                                <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                                    <Tag size={18} />
                                </span>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">{discount.code}</div>
                                    <p className="text-xs text-zinc-400">{discount.description || "No description yet"}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeDiscount(discount.id)}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Discount Code</label>
                                <input
                                    type="text"
                                    value={discount.code}
                                    onChange={(e) => updateDiscountField(discount.id, "code", e.target.value)}
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
                                    <option value="fixed">Fixed</option>
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
                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Minimum Nights</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={discount.minNights}
                                    onChange={(e) => updateDiscountField(discount.id, "minNights", Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                />
                            </div>

                            <div className="relative">
                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Allowed Users</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {discount.allowedRecipients.map((recipient) => (
                                        <span key={recipient} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">
                                            {recipient}
                                            <button
                                                type="button"
                                                onClick={() => removeRecipient(discount.id, recipient)}
                                                className="text-zinc-500 hover:text-zinc-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type email or name, then press Enter"
                                        value={recipientDrafts[discount.id] || ""}
                                        onChange={(e) => handleRecipientDraftChange(discount.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === ",") {
                                                e.preventDefault();
                                                addRecipientsFromDraft(discount.id, recipientDrafts[discount.id] || "");
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:border-[#D4AF37] outline-none text-xs font-bold"
                                    />
                                    {recipientDrafts[discount.id] ? (
                                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-44 overflow-y-auto rounded-3xl border border-zinc-100 bg-white p-3 shadow-2xl">
                                            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Suggested users</div>
                                            <div className="space-y-2">
                                                {suggestedRecipients
                                                    .filter((recipient) => recipient.toLowerCase().includes((recipientDrafts[discount.id] || "").toLowerCase()) && !discount.allowedRecipients.includes(recipient))
                                                    .slice(0, 6)
                                                    .map((recipient) => (
                                                        <button
                                                            key={recipient}
                                                            type="button"
                                                            onClick={() => addRecipientsFromDraft(discount.id, recipient)}
                                                            className="w-full text-left rounded-2xl border border-zinc-100 px-3 py-2 bg-zinc-50 text-zinc-800 text-[10px] hover:bg-zinc-100"
                                                        >
                                                            {recipient}
                                                        </button>
                                                    ))}
                                                {!suggestedRecipients.some((recipient) => recipient.toLowerCase().includes((recipientDrafts[discount.id] || "").toLowerCase()) && !discount.allowedRecipients.includes(recipient)) && (
                                                    <div className="text-[10px] text-zinc-400">No matches found.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addRecipientsFromDraft(discount.id, recipientDrafts[discount.id] || "")}
                                    className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800"
                                >
                                    Add recipient
                                </button>
                                <p className="mt-2 text-[8px] text-zinc-500 uppercase tracking-[0.2em]">Add email or name, then press Enter. Leave blank to allow anyone.</p>
                            </div>

                            <div className="flex items-center gap-2 justify-between rounded-2xl bg-zinc-950/5 border border-zinc-100 p-4">
                                <div>
                                    <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black">Status</div>
                                    <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase ${discount.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                                        {discount.active ? "Active" : "Disabled"}
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateDiscountField(discount.id, "active", !discount.active)}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                                >
                                    {discount.active ? "Disable" : "Enable"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-zinc-100 pt-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg disabled:opacity-40"
                >
                    <Save size={14} />
                    <span>{saving ? "Saving discount rules..." : "Save discount rules"}</span>
                </button>
                {statusMessage && (
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{statusMessage}</div>
                )}
            </div>
        </div>
    );
}
