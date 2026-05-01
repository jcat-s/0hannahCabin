import React from "react";
import { ChevronLeft } from "lucide-react";
import { useBooking } from "../hooks/useBooking";
import { PriceSummary } from "./PriceSummary";
import { CalendarBooked } from "./CalendarBooked";
import { BookingCategory, StayCategorySection } from "./BookingCategory";
import { BookingConfirmation } from "./BookingConfirmation";

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
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-zinc-500 uppercase tracking-[0.25em] text-[10px] font-black">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">4</span>
                            Booking Details
                        </div>
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
                        isHighRate={booking.isHighRate}
                        canBookCore={booking.isDateRangeValid && booking.selectedColor !== "" && booking.durationCount > 0}
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
