import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Check, ArrowRight } from "lucide-react";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. I-construct ang body ng email
    const emailBody = `Guest Name: ${name}%0D%0AGuest Email: ${email}%0D%0A%0D%0AMessage:%0D%0A${message}`;

    // 2. Mailto Link (Direct to Gmail Compose)
    // Nilagay ko ang 'ohannahresort@gmail.com' gaya ng request mo
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=ohannahresort@gmail.com&su=${encodeURIComponent(subject)}&body=${emailBody}`;

    // 3. I-open ang Gmail sa bagong tab
    window.open(mailtoLink, "_blank");

    // 4. Ipakita ang success state sa website
    setIsSubmitted(true);

    // Reset form after a few seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 3000);
  };

  const contactInfo = [
    { icon: MapPin, label: "Location", value: "CP Reyes, Malvar, Batangas, PH" },
    { icon: Phone, label: "Reservations", value: "0956 816 2888" },
    { icon: Mail, label: "Inquiries", value: "ohannahresort@gmail.com" },
    { icon: Clock, label: "Concierge", value: "Mon - Sun, 9AM - 6PM" },
  ];

  return (
    <section id="contact" className="py-24 bg-[#FAFAFA] scroll-mt-20 text-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-[#D4AF37]"></span>
            <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold">Connect</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic">
            Begin Your <span className="not-italic">Escape</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-12">
            <p className="text-zinc-500 font-light leading-relaxed">
              Whether you have questions about our amenities or want to book a private event, our team is here to assist you.
            </p>
            <div className="space-y-8">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="flex items-start gap-5">
                  <div className="mt-1">
                    <info.icon className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">{info.label}</p>
                    <p className="text-zinc-800 font-medium">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100 rounded-2xl">
              {isSubmitted ? (
                <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-2xl font-serif italic mb-2">Redirecting to Gmail...</h3>
                  <p className="text-zinc-500">Please complete the sending process in the new window.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1 border-b border-zinc-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Full Name</label>
                    <input
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe" className="w-full bg-transparent border-none focus:ring-0 px-0 py-2"
                    />
                  </div>
                  <div className="space-y-1 border-b border-zinc-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Email Address</label>
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com" className="w-full bg-transparent border-none focus:ring-0 px-0 py-2"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1 border-b border-zinc-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Subject</label>
                    <input
                      type="text" required value={subject} onChange={(e) => setSubject(e.target.value)}
                      placeholder="Reservation Inquiry" className="w-full bg-transparent border-none focus:ring-0 px-0 py-2"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1 border-b border-zinc-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Message</label>
                    <textarea
                      rows={4} required value={message} onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us more..." className="w-full bg-transparent border-none focus:ring-0 px-0 py-2 resize-none"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      className="group relative flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 bg-zinc-900 text-white text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all overflow-hidden"
                    >
                      <span className="relative z-10">Open Gmail to Send</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 relative z-10" />
                      <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}