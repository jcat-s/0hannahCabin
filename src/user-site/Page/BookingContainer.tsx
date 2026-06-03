import React, { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useBooking } from "../hooks/useBooking";
import { PriceSummary } from "./PriceSummary";
import { CalendarBooked } from "./CalendarBooked";
import { BookingCategory, StayCategorySection } from "./BookingCategory";
import { BookingConfirmation } from "./BookingConfirmation";
import { parseISO, isSameDay, startOfDay } from "date-fns";

export function BookingContainer({ onBack, onRequireAuth }: { onBack: () => void; onRequireAuth?: () => void }) {
    const booking = useBooking();

    // Show confirmation if booking submitted
    if (booking.showConfirmation && booking.lastBookingData) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-10 px-6">
                <BookingConfirmation
                    bookingData={booking.lastBookingData}
                    onBack={() => booking.setShowConfirmation(false)}
                />
            </div>
        );
    }

    // BYPASS VALIDATION LOGIC WITH MANDATORY COLOR SELECTION:
    const isFormReadyToBook = useMemo(() => {
        if (!booking.checkIn) return false;

        // CRITICAL RULE: Siguraduhin na may napiling kulay ang admin o user bago magpatuloy
        if (!booking.selectedColor || booking.selectedColor.trim() === "") {
            return false;
        }

        // 1. Alamin kung may kaparehong booking range conflict sa gitna
        const confirmedBookings = (booking.filteredBookings || []).filter(
            (b: any) => String(b.status).toLowerCase() === "confirmed"
        );

        let hasOverlapConflict = false;
        const targetCheckIn = startOfDay(parseISO(booking.checkIn));
        const targetCheckOut = booking.checkOut ? startOfDay(parseISO(booking.checkOut)) : targetCheckIn;

        for (const b of confirmedBookings) {
            const bStart = startOfDay(parseISO(b.checkInDate || b.checkIn));
            const bEnd = startOfDay(parseISO(b.checkOutDate || b.checkOut));
            const bType = String(b.stayType || '').toLowerCase();
            const slotStr = String(b.fullStayOption || b.timeSlot || b.stayCategory || '').toUpperCase();

            // Hanapin kung ang booking ay 9AM-7AM checkout transition block ngayon
            const is7AMCheckout = slotStr.includes("9AM-7AM") || slotStr.includes("9AM TO 7AM") || bType === 'evening';

            if (booking.stayType === 'full') {
                // Kung magkatugma ang Check-in mo sa Checkout ng iba na aalis ng 7AM, WALANG CONFLICT.
                if (isSameDay(targetCheckIn, bEnd) && is7AMCheckout) {
                    continue;
                }

                // Normal overlap protection para sa ibang gitnang araw
                if (targetCheckIn < bEnd && targetCheckOut > bStart) {
                    hasOverlapConflict = true;
                    break;
                }
            } else {
                // Para sa Day Lounge o Evening Chill bookings
                if (isSameDay(targetCheckIn, bStart) || isSameDay(targetCheckIn, bEnd)) {
                    if (isSameDay(targetCheckIn, bEnd) && is7AMCheckout) {
                        // Ligtas ka dito dahil umaga pa lang (7AM) umalis na ang lumang booking
                        continue;
                    }
                    hasOverlapConflict = true;
                    break;
                }
            }
        }

        if (hasOverlapConflict) return false;

        // 2. Patunayan kung tama ang bilang ng gabi/araw (Duration count logic bypass)
        const isDurationValid = booking.stayType === "full" ? booking.durationCount > 0 : booking.durationCount >= 0;

        return isDurationValid;
    }, [
        booking.checkIn,
        booking.checkOut,
        booking.stayType,
        booking.durationCount,
        booking.filteredBookings,
        booking.selectedColor // Kasama na sa dependency tracker para mag-update ang form kapag pinindot ang kulay
    ]);

    return (
        <div className="min-h-screen bg-[#FDFCFB] pb-24 text-zinc-900">
            <nav className="bg-white/80 backdrop-blur-xl border-b px-8 py-6 flex items-center justify-between sticky top-0 z-50">
                <button onClick={onBack} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-950 transition-colors">
                    <ChevronLeft size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit</span>
                </button>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Reservation Details</div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-zinc-500 uppercase tracking-[0.25em] text-[10px] font-black">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">1</span>
                            Stay Category
                        </div>
                        <StayCategorySection
                            stayType={booking.stayType}
                            setStayType={(t) => {
                                booking.setStayType(t);
                                booking.handleDateLogic(booking.checkIn, t);
                            }}
                            fullStayOption={booking.fullStayOption}
                            setFullStayOption={booking.setFullStayOption}
                            checkIn={booking.checkIn}
                            checkOut={booking.checkOut}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-zinc-500 uppercase tracking-[0.25em] text-[10px] font-black">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">2</span>
                            Select Cabin
                        </div>
                        <section className="bg-zinc-950 p-2 rounded-[2rem] flex gap-2 shadow-2xl">
                            {(["ohannah", "dream"] as const).map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        booking.setCabin(c);
                                        booking.setSelectedColor("");
                                    }}
                                    className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${booking.cabin === c ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'
                                        }`}
                                >
                                    {c === 'ohannah' ? 'Ohannah Cabin' : 'The Dream'}
                                </button>
                            ))}
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-zinc-500 uppercase tracking-[0.25em] text-[10px] font-black">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">3</span>
                            Pick Your Dates
                        </div>
                        <CalendarBooked
                            currentViewDate={booking.currentViewDate}
                            setCurrentViewDate={booking.setCurrentViewDate}
                            filteredBookings={booking.filteredBookings}
                            checkIn={booking.checkIn}
                            setCheckIn={booking.setCheckIn}
                            checkOut={booking.checkOut}
                            setCheckOut={booking.setCheckOut}
                            stayType={booking.stayType}
                            fullStayOption={booking.fullStayOption}
                        />
                    </div>

                    <div className="space-y-6">
                        <BookingCategory
                            cabin={booking.cabin}
                            stayType={booking.stayType}
                            setStayType={(t) => {
                                booking.setStayType(t);
                                booking.handleDateLogic(booking.checkIn, t);
                            }}
                            checkIn={booking.checkIn}
                            setCheckIn={(d) => booking.handleDateLogic(d, booking.stayType)}
                            checkOut={booking.checkOut}
                            setCheckOut={booking.setCheckOut}
                            guests={booking.guests}
                            setGuests={booking.setGuests}
                            kids={booking.kids}
                            setKids={booking.setKids}
                            pets={booking.pets}
                            setPets={booking.setPets}
                            specialOccasion={booking.specialOccasion}
                            setSpecialOccasion={booking.setSpecialOccasion}
                            selectedColor={booking.selectedColor}
                            setSelectedColor={booking.setSelectedColor}
                            fullStayOption={booking.fullStayOption}
                            setFullStayOption={booking.setFullStayOption}
                            filteredBookings={booking.filteredBookings}
                            todayStr={booking.todayStr}
                        />
                    </div>
                </div>

                {/* Price Summary Sidebar */}
                <div className="lg:col-span-4 h-fit sticky top-32">
                    <PriceSummary
                        cabin={booking.cabin}
                        stayType={booking.stayType}
                        fullStayOption={booking.fullStayOption}
                        guests={booking.guests}
                        kids={booking.kids}
                        pets={booking.pets}
                        checkIn={booking.checkIn}
                        checkOut={booking.checkOut}
                        specialOccasion={booking.specialOccasion}
                        durationCount={booking.durationCount}

                        // Gumagana na ang matalinong transition slot para sa date 7, pero protektado pa rin ng color checker!
                        canBookCore={isFormReadyToBook}
                        submitting={booking.submitting}
                        onSubmit={booking.handleBooking}
                    />
                    <p className="text-center text-[9px] text-zinc-400 mt-6 uppercase tracking-widest leading-relaxed">
                        Review your request and dates <br /> before proceeding to final confirmation.
                    </p>
                </div>
            </div>
        </div>
    );
}