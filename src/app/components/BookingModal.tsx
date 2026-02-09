import { useState } from "react";
import { X, Check, ArrowLeft, ArrowRight, CreditCard, Calendar as CalendarIcon, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = "login" | "dates" | "payment" | "review";

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("login");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Login/Signup state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Booking dates state
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("2");
  const [specialRequests, setSpecialRequests] = useState("");

  // Payment state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const basePrice = 8500;
  const nights = checkIn && checkOut 
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const subtotal = nights * basePrice;
  const cleaningFee = 1500;
  const total = subtotal + cleaningFee;

  const handleClose = () => {
    setCurrentStep("login");
    setIsSubmitted(false);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("dates");
  };

  const handleDatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("review");
  };

  const handleFinalSubmit = () => {
    setIsSubmitted(true);
  };

  const goBack = () => {
    if (currentStep === "dates") setCurrentStep("login");
    else if (currentStep === "payment") setCurrentStep("dates");
    else if (currentStep === "review") setCurrentStep("payment");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-700" />
            </div>
            <div>
              <h2 className="text-3xl text-gray-900 mb-3">Booking Confirmed!</h2>
              <p className="text-xl text-gray-600 mb-2">
                Thank you for your booking, {name || email}!
              </p>
              <p className="text-gray-600">
                Your reservation has been confirmed. We'll send you a confirmation email shortly.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto text-left space-y-3">
              <h3 className="text-lg text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="text-gray-900">{checkIn ? format(checkIn, "MMM d, yyyy") : "Not selected"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="text-gray-900">{checkOut ? format(checkOut, "MMM d, yyyy") : "Not selected"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="text-gray-900">{guests}</span>
                </p>
                <div className="border-t pt-2 mt-2">
                  <p className="flex justify-between">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">₱{total.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleClose} className="bg-green-700 hover:bg-green-800">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {currentStep !== "login" && (
                    <button
                      onClick={goBack}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <span>
                    {currentStep === "login" && (isLogin ? "Log in" : "Sign up")}
                    {currentStep === "dates" && "Select Dates"}
                    {currentStep === "payment" && "Add Payment Method"}
                    {currentStep === "review" && "Review Your Request"}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </DialogTitle>
              <DialogDescription className="sr-only">
                {currentStep === "login" && "Complete your login or signup to continue with booking"}
                {currentStep === "dates" && "Select your check-in and check-out dates"}
                {currentStep === "payment" && "Enter your payment information"}
                {currentStep === "review" && "Review your booking details before confirming"}
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded ${currentStep === "login" || currentStep === "dates" || currentStep === "payment" || currentStep === "review" ? "bg-green-700" : "bg-gray-200"}`}></div>
              <div className={`flex-1 h-1 rounded ${currentStep === "dates" || currentStep === "payment" || currentStep === "review" ? "bg-green-700" : "bg-gray-200"}`}></div>
              <div className={`flex-1 h-1 rounded ${currentStep === "payment" || currentStep === "review" ? "bg-green-700" : "bg-gray-200"}`}></div>
              <div className={`flex-1 h-1 rounded ${currentStep === "review" ? "bg-green-700" : "bg-gray-200"}`}></div>
            </div>

            {/* Step 1: Login/Signup */}
            {currentStep === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    {isLogin ? "Log in to continue with your booking" : "Create an account to get started"}
                  </p>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+63 XXX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                  Continue
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-green-700 hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Select Dates */}
            {currentStep === "dates" && (
              <form onSubmit={handleDatesSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <div className="border rounded-md p-3">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        className="rounded-md"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <div className="border rounded-md p-3">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < new Date() || (checkIn ? date <= checkIn : false)}
                        className="rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="10"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="requests"
                    placeholder="Let us know if you have any special requirements..."
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="text-sm text-gray-900 mb-2">Price Details</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">₱{basePrice.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span className="text-gray-900">₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cleaning fee</span>
                    <span className="text-gray-900">₱{cleaningFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₱{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={!checkIn || !checkOut}
                >
                  Continue to Payment
                </Button>
              </form>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === "payment" && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-700" />
                  <div>
                    <p className="text-sm text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-600">Your payment information is encrypted and secure</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card *</Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                  Continue to Review
                </Button>
              </form>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg text-gray-900">Booking Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-gray-600">Check-in: {checkIn ? format(checkIn, "MMMM d, yyyy") : "Not selected"}</div>
                          <div className="text-gray-600">Check-out: {checkOut ? format(checkOut, "MMM d, yyyy") : "Not selected"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{guests} {parseInt(guests) === 1 ? 'guest' : 'guests'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg text-gray-900">Guest Details</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Name: <span className="text-gray-900">{name || email}</span></p>
                      <p className="text-gray-600">Email: <span className="text-gray-900">{email}</span></p>
                      {phone && <p className="text-gray-600">Phone: <span className="text-gray-900">{phone}</span></p>}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg text-gray-900">Payment Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">₱{basePrice.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                        <span className="text-gray-900">₱{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cleaning fee</span>
                        <span className="text-gray-900">₱{cleaningFee.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">₱{total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Payment Method: •••• {cardNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
                  By confirming, you agree to our booking terms and cancellation policy. You'll be charged the full amount upon confirmation.
                </div>

                <Button
                  onClick={handleFinalSubmit}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  Confirm and Book
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}