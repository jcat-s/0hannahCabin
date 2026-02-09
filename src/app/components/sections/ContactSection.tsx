import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 3000);
  };

  return (
    <section id="contact" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">Contact Us</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get In Touch</CardTitle>
                <CardDescription>We're here to help and answer any questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-sm mb-1 text-gray-900">Address</h3>
                      <p className="text-sm text-gray-600">
                        Malvar, Batangas<br />
                        Philippines
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-sm mb-1 text-gray-900">Phone</h3>
                      <p className="text-sm text-gray-600">
                        +63 XXX XXX XXXX
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-sm mb-1 text-gray-900">Email</h3>
                      <p className="text-sm text-gray-600">
                        info@ohannahcabin.com
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-sm mb-1 text-gray-900">Hours</h3>
                      <p className="text-sm text-gray-600">
                        Monday - Sunday<br />
                        9:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-green-700" />
                    </div>
                    <h3 className="text-2xl text-gray-900">Message Sent!</h3>
                    <p className="text-gray-600">
                      Thank you for contacting us. We'll respond shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Booking inquiry, general question, etc."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-700 hover:bg-green-800"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl text-center mb-8 text-gray-900">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h4 className="text-lg text-gray-900 mb-2">What is the check-in and check-out time?</h4>
              <p className="text-gray-600">Check-in is from 2:00 PM and check-out is until 12:00 PM. Early check-in or late check-out may be arranged upon request.</p>
            </div>
            <div className="border-b pb-6">
              <h4 className="text-lg text-gray-900 mb-2">How many guests can the cabin accommodate?</h4>
              <p className="text-gray-600">Ohannah Cabin can comfortably accommodate 8-10 guests with multiple bedrooms.</p>
            </div>
            <div className="border-b pb-6">
              <h4 className="text-lg text-gray-900 mb-2">Is the property pet-friendly?</h4>
              <p className="text-gray-600">Yes, we welcome pets with prior arrangement. Please contact us in advance.</p>
            </div>
            <div className="pb-6">
              <h4 className="text-lg text-gray-900 mb-2">What is your cancellation policy?</h4>
              <p className="text-gray-600">We offer flexible cancellation up to 7 days before your check-in date.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
