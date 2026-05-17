"use client";

import { useState } from "react";
import Link from "next/link";
import Head from "next/head"; // Added for SEO
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  User,
  Calendar,
  Building2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Heart,
  Ambulance,
  Stethoscope,
  Pill,
  Microscope,
  Globe,
  Headphones,
  Award,
  Shield,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Navigation,
  Car,
  Train,
  Bus,
  Plane,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredContact: "email"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        preferredContact: "email"
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  // Updated contact info based on reference code
  const contactInfo = [
    {
      title: "Emergency & Appointments",
      icon: <Phone className="w-6 h-6" />,
      details: [
        { label: "Call Now", value: "+91 95409 29832", href: "tel:+919540929832" },
        { label: "WhatsApp", value: "+91 95409 29832", href: "https://wa.me/919540929832?text=Hi%20Doctor,%0AI%20would%20like%20to%20book%20a%20dental%20consultation." }
      ],
      color: "bg-red-50 text-red-600",
      gradient: "from-red-500 to-red-600"
    },
    {
      title: "Clinic Hours",
      icon: <Clock className="w-6 h-6" />,
      details: [
        { label: "Monday - Saturday", value: "11:30 AM - 8:30 PM", href: "#" },
        { label: "Sunday", value: "Closed", href: "#" }
      ],
      color: "bg-blue-50 text-blue-600",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Email & Social",
      icon: <Globe className="w-6 h-6" />,
      details: [
        { label: "Email Us", value: "info@abdhindmedicare.com", href: "mailto:info@abdhindmedicare.com" },
        // { label: "Follow Us", value: "@mrdentalclinic", href: "https://instagram.com/mrdentalclinic" }
      ],
      color: "bg-green-50 text-green-600",
      gradient: "from-green-500 to-green-600"
    }
  ];

  // Updated location based on reference code
  const locations = [
    {
      name: "MR Dental Clinic - Jama Masjid",
      address: "887, Near Salam Hotel, Churiwalan, Jama Masjid, New Delhi, Delhi 110006",
      phone: "+91 95409 29832",
      email: "info@abdhindmedicare.com",
      timings: "Mon-Sat: 11:30 AM - 8:30 PM",
      facilities: ["Dental Implants", "Root Canal", "Smile Makeover", "Pediatric Dentistry", "Laser Dentistry"]
    }
  ];

  // Updated FAQs based on reference dental context
  const faqs = [
    {
      q: "How do I book a dental appointment?",
      a: "You can book an appointment by calling us at +91 95409 29832, sending a WhatsApp message, or using the contact form on this page. We recommend booking in advance for your preferred time slot."
    },
    {
      q: "Is parking available at the clinic?",
      a: "Yes, paid parking is available near Salam Hotel, just a short walk from our clinic in Churiwalan, Jama Masjid."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept cash, all major credit/debit cards, UPI payments, and provide insurance assistance for cashless claims."
    },
    {
      q: "Do you offer emergency dental services?",
      a: "Yes, we provide emergency dental care during our working hours. Please call us immediately at +91 95409 29832 if you have severe pain, swelling, or trauma."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* SEO Optimization */}
      <Head>
        <title>Contact MR Dental Clinic | Best Dentist in Delhi | Book Appointment</title>
        <meta
          name="description"
          content="Contact MR Dental Clinic in Jama Masjid, Delhi. Call +91 95409 29832 for dental implants, root canals, and smile makeovers. Book your appointment with Dr. Ekhlaq Ahmed today."
        />
        <meta
          name="keywords"
          content="dental clinic contact delhi, dentist near jama masjid, book dental appointment delhi, dr ekhlaq ahmed contact, emergency dental care delhi"
        />
        <meta name="author" content="Dr. Ekhlaq Ahmed | MR Dental Clinic" />
        <link rel="canonical" href="https://www.mrdentalclinic.com/contact" />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span className="text-sm font-medium">Contact & Location</span>
            </div>
            {/* <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Visit <span className="text-teal-300">MR Dental Clinic</span>
            </h1> */}
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Located in the heart of Old Delhi near Jama Masjid. We are here to provide 
              world-class regenerative dentistry in a comfortable and caring environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:+919540929832"
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Call Now: +91 95409 29832
              </a>
              <a
                href="https://wa.me/919540929832?text=Hi%20Doctor,%0AI%20would%20like%20to%20book%20a%20dental%20consultation."
                target="_blank"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <div className="relative -mt-10 max-w-7xl mx-auto px-4 z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <div className={`inline-flex p-3 rounded-xl ${info.color} mb-4 group-hover:scale-110 transition-transform`}>
                {info.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{info.title}</h3>
              <div className="space-y-2">
                {info.details.map((detail, idx) => (
                  <a
                    key={idx}
                    href={detail.href}
                    className="block text-gray-600 hover:text-teal-600 transition group-hover:translate-x-1"
                  >
                    {detail.value}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Book an Appointment</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">
              Fill out the form below and our team will get back to you within 24 hours 
              to confirm your appointment.
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Appointment Request Sent!</h3>
                <p className="text-gray-600">
                  Thank you for contacting MR Dental Clinic. We will call or WhatsApp you shortly to confirm your appointment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
                        placeholder="+91 Enter mobile number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
                        placeholder="e.g., Root Canal, Implant, Checkup"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message / Dental Concern *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
                    placeholder="Please describe your dental issue or preferred appointment time..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="phone"
                        checked={formData.preferredContact === "phone"}
                        onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="text-teal-600"
                      />
                      <span className="text-sm text-gray-700">Phone Call</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="whatsapp"
                        checked={formData.preferredContact === "whatsapp"}
                        onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="text-teal-600"
                      />
                      <span className="text-sm text-gray-700">WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="email"
                        checked={formData.preferredContact === "email"}
                        onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="text-teal-600"
                      />
                      <span className="text-sm text-gray-700">Email</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Map & Information */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="h-64 bg-gradient-to-br from-teal-100 to-blue-100 relative">
                {/* Google Maps Embed */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.3629787781097!2d77.22971747570972!3d28.648848383339203!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfdc994434315%3A0x7b4d5e3f46f9daf!2sDr%20Ekhlaq%20Ahmed%20(%20M%20R%20Dental%20care(maximum%20regenerative%20)clinic%20)!5e0!3m2!1sen!2sin!4v1767090335091!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MR Dental Clinic Location Map"
                  className="absolute inset-0"
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">MR Dental Clinic - Jama Masjid</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Address</p>
                      <p className="text-gray-600">887, Near Salam Hotel, Churiwalan, Jama Masjid, New Delhi, Delhi 110006</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Clinic Hours</p>
                      <p className="text-gray-600">Monday - Saturday: 11:30 AM - 8:30 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Landmarks</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          <MapPin className="w-3 h-3" /> Near Salam Hotel
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          <Train className="w-3 h-3" /> 5 min from Jama Masjid Metro
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          <Car className="w-3 h-3" /> Parking Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media & Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Connect & Review Us</h3>
              <p className="text-gray-600 mb-4">
                Follow us for dental tips or leave a review on Google.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Heart className="w-5 h-5" />
                </a>
                <a href="https://www.google.com/search?q=mr+dental+clinic+jama+masjid" target="_blank" className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Star className="w-5 h-5" />
                </a>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm text-gray-700 font-medium">5.0 Google Rating (300+ Reviews)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Visit Our Clinic</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Location</h2>
            <p className="text-gray-600">
              Conveniently located in the heart of Old Delhi, serving patients from all across NCR
            </p>
          </div>
          <div className="flex justify-center">
            <div className="max-w-2xl w-full">
              {locations.map((location, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {/* <Tooth className="w-7 h-7 text-teal-600" /> */}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{location.name}</h3>
                      <p className="text-gray-600 mb-4">{location.address}</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <a href={`tel:${location.phone}`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                            <Phone className="w-4 h-4" />
                            {location.phone}
                          </a>
                          <a href={`mailto:${location.email}`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mt-2">
                            <Mail className="w-4 h-4" />
                            {location.email}
                          </a>
                          <div className="flex items-center gap-2 text-gray-600 mt-2">
                            <Clock className="w-4 h-4" />
                            {location.timings}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {location.facilities.map((facility, idx) => (
                            <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full font-medium">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Common Questions</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Find quick answers about visiting MR Dental Clinic
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}