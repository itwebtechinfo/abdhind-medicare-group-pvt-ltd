"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
  ChevronLeft,
  Sparkles
} from "lucide-react";

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Cardiologist",
      experience: 18,
      rating: 4.9,
      available: true
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Neurologist",
      experience: 14,
      rating: 4.8,
      available: true
    },
    {
      id: 3,
      name: "Dr. Anil Mehta",
      specialty: "Orthopedic Surgeon",
      experience: 22,
      rating: 4.9,
      available: true
    },
    {
      id: 4,
      name: "Dr. Meera Gupta",
      specialty: "Pediatrician",
      experience: 12,
      rating: 4.9,
      available: true
    },
    {
      id: 5,
      name: "Dr. Sunil Verma",
      specialty: "Ophthalmologist",
      experience: 10,
      rating: 4.7,
      available: true
    },
    {
      id: 6,
      name: "Dr. Vikram Reddy",
      specialty: "General Physician",
      experience: 8,
      rating: 4.6,
      available: true
    }
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        full: `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`,
        isToday: i === 0
      });
    }
    return dates;
  };

  const availableDates = getDates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newBookingId = "APT" + Math.random().toString(36).substr(2, 8).toUpperCase();
      setBookingId(newBookingId);
      setIsSubmitting(false);
      setBookingConfirmed(true);
    }, 1500);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
          <p className="text-gray-500 mb-6">Your appointment has been confirmed</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
            <p className="text-xl font-bold text-teal-600 font-mono">{bookingId}</p>
          </div>

          <div className="space-y-3 text-left mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Doctor</span>
              <span className="font-medium">{selectedDoctor?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Specialty</span>
              <span className="font-medium">{selectedDoctor?.specialty}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-medium">{selectedDate} • {selectedTime}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Patient Name</span>
              <span className="font-medium">{formData.name}</span>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full bg-teal-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-teal-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-500">Consult with top doctors in 3 simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex justify-between items-center">
            <div className="flex-1 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold ${
                step >= 1 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                1
              </div>
              <p className="text-sm text-gray-600">Select Doctor</p>
            </div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-teal-600" : "bg-gray-200"}`} />
            <div className="flex-1 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold ${
                step >= 2 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
              <p className="text-sm text-gray-600">Choose Time</p>
            </div>
            <div className={`flex-1 h-0.5 ${step >= 3 ? "bg-teal-600" : "bg-gray-200"}`} />
            <div className="flex-1 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold ${
                step >= 3 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                3
              </div>
              <p className="text-sm text-gray-600">Your Details</p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedDoctor?.id === doctor.id ? "border-teal-500 bg-teal-50" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-7 h-7 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-teal-600">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs ml-1">{doctor.rating}</span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{doctor.experience} years</span>
                      </div>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => selectedDoctor && setStep(2)}
                disabled={!selectedDoctor}
                className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedDoctor && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Selected Doctor Info */}
            <div className="flex items-center gap-4 pb-6 mb-6 border-b">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-sm text-teal-600 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Date Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {availableDates.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date.full)}
                    className={`p-3 rounded-lg text-center transition border ${
                      selectedDate === date.full
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-gray-200 hover:border-teal-400 hover:bg-teal-50"
                    }`}
                  >
                    <p className="text-xs font-medium">{date.day}</p>
                    <p className="text-lg font-bold">{date.date}</p>
                    <p className="text-xs">{date.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2 rounded-lg text-center text-sm transition border ${
                        selectedTime === slot
                          ? "bg-teal-600 text-white border-teal-600"
                          : "border-gray-200 hover:border-teal-400 hover:bg-teal-50"
                      }`}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => selectedDate && selectedTime && setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && selectedDoctor && selectedDate && selectedTime && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Booking Summary</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Doctor:</span> {selectedDoctor.name} - {selectedDoctor.specialty}</p>
                  <p><span className="text-gray-500">Date & Time:</span> {selectedDate} at {selectedTime}</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                  className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}