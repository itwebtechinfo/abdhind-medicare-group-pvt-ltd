"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Clock,
  User,
  Phone,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Baby,
  ArrowRight,
  CheckCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { publicBookingService } from "@/src/features/public-booking/public-booking";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "@/src/features/public-booking/public-booking";
import type { PublicDoctor, PublicSlot } from "@/src/features/public-booking/public-booking";

interface ComingSoonDepartment {
  name: string;
  specialty: string;
  description: string;
  icon: typeof Heart;
}

const COMING_SOON_DEPARTMENTS: ComingSoonDepartment[] = [
  {
    name: "Cardiology Department",
    specialty: "Cardiology",
    description: "ECG, preventive cardiology, hypertension clinic, and cardiac rehabilitation services are being prepared.",
    icon: Heart,
  },
  {
    name: "Orthopedics Department",
    specialty: "Orthopedics",
    description: "Joint pain, fracture care, sports injury, and physiotherapy-led recovery services are planned.",
    icon: Bone,
  },
  {
    name: "Pediatrics Department",
    specialty: "Pediatrics",
    description: "Child consultations, vaccination planning, growth monitoring, and pediatric emergency guidance are upcoming.",
    icon: Baby,
  },
  {
    name: "Neurology Department",
    specialty: "Neurology",
    description: "Headache, seizure, stroke follow-up, and neurodiagnostic services are under expansion.",
    icon: Brain,
  },
];

function getDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      iso: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return dates;
}

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", age: "", gender: "", address: "" });
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [bookingId, setBookingId] = useState("");

  const availableDates = useMemo(() => getDates(), []);

  const { data: doctors = [] } = useQuery({
    queryKey: ["public", "doctors"],
    queryFn: async () => (await publicBookingService.listDoctors()).data.doctors,
  });

  const { data: slots = [], isFetching: slotsLoading } = useQuery({
    queryKey: ["public", "doctors", selectedDoctor?.id, "slots", selectedDate],
    queryFn: async () =>
      (await publicBookingService.listSlots(selectedDoctor?.id as string, selectedDate)).data.slots,
    enabled: Boolean(selectedDoctor) && Boolean(selectedDate),
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otpMutation = useMutation({
    mutationFn: () => publicBookingService.requestOtp(formData.phone),
    onSuccess: () => {
      toast.success("OTP sent", "Check WhatsApp for your 6-digit code.");
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      publicBookingService.book({
        patient_phone: formData.phone,
        patient_name: formData.name,
        patient_age: Number(formData.age),
        patient_gender: formData.gender,
        patient_address: formData.address,
        doctor_id: selectedDoctor?.id as string,
        slot_id: selectedSlot?.id as string,
        otp,
      }),
    onSuccess: (res) => {
      // Prefer the human-friendly reference_code (e.g. "MRD-2026-00001") over
      // the raw Mongo _id; fall back to the id if it's ever missing so this
      // screen never shows a blank Booking ID.
      setBookingId(res.data.appointment.reference_code ?? res.data.appointment.id);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  if (bookMutation.isSuccess) {
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
              <span className="font-medium">{selectedDoctor?.full_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Specialty</span>
              <span className="font-medium">{selectedDoctor?.specialization}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Date &amp; Time</span>
              <span className="font-medium">
                {selectedDate} • {selectedSlot?.start_time}
              </span>
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
    <div className="min-h-screen bg-[#f7f9f8] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 rounded-[28px] border border-emerald-100 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Dental Clinic Active Now
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">Book an Appointment</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Dental appointments are currently available; other specialties are listed as upcoming services.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex justify-between items-center">
            {["Select Doctor", "Choose Time", "Your Details", "Verify"].map((label, idx) => (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex-1 text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold ${
                      step >= idx + 1 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
                {idx < 3 && (
                  <div className={`h-0.5 w-8 md:w-16 ${step >= idx + 2 ? "bg-teal-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                    selectedDoctor?.id === doctor.id ? "border-teal-500 bg-teal-50 shadow-lg" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-7 h-7 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">{doctor.full_name}</h3>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          Available Now
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-teal-600">{doctor.specialization}</p>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                </div>
              ))}
              {COMING_SOON_DEPARTMENTS.map((dept) => (
                <div key={dept.name} className="bg-white rounded-2xl border border-gray-200 p-5 opacity-85 cursor-not-allowed">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                      <dept.icon className="w-7 h-7 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">{dept.name}</h3>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-teal-600">{dept.specialty}</p>
                      <p className="mt-2 text-xs leading-5 text-gray-500">{dept.description}</p>
                    </div>
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
            <div className="flex items-center gap-4 pb-6 mb-6 border-b">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedDoctor.full_name}</h3>
                <p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-sm text-teal-600 hover:underline">
                Change
              </button>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {availableDates.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setSelectedDate(d.iso);
                      setSelectedSlot(null);
                    }}
                    className={`p-3 rounded-lg text-center transition border ${
                      selectedDate === d.iso
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-gray-200 hover:border-teal-400 hover:bg-teal-50"
                    }`}
                  >
                    <p className="text-xs font-medium">{d.day}</p>
                    <p className="text-lg font-bold">{d.date}</p>
                    <p className="text-xs">{d.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
                {slotsLoading && <p className="text-sm text-gray-500">Loading slots…</p>}
                {!slotsLoading && slots.length === 0 && (
                  <p className="text-sm text-gray-500">No open slots for this date.</p>
                )}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg text-center text-sm transition border ${
                        selectedSlot?.id === slot.id
                          ? "bg-teal-600 text-white border-teal-600"
                          : "border-gray-200 hover:border-teal-400 hover:bg-teal-50"
                      }`}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {slot.start_time}
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
                onClick={() => selectedDate && selectedSlot && setStep(3)}
                disabled={!selectedDate || !selectedSlot}
                className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && selectedDoctor && selectedDate && selectedSlot && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Details</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(4);
                otpMutation.mutate();
              }}
              className="space-y-5"
            >
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={150}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Booking Summary</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Doctor:</span> {selectedDoctor.full_name} -{" "}
                    {selectedDoctor.specialization}
                  </p>
                  <p>
                    <span className="text-gray-500">Date &amp; Time:</span> {selectedDate} at{" "}
                    {selectedSlot.start_time}
                  </p>
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
                  disabled={!formData.name || !formData.phone}
                  className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send OTP
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: OTP verification */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Verify Your Number</h2>
                <p className="text-sm text-gray-500">
                  Enter the 6-digit code sent to your WhatsApp ({formData.phone})
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                bookMutation.mutate();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                className="w-full text-center tracking-[0.5em] text-2xl font-bold px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                placeholder="000000"
              />

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => otpMutation.mutate()}
                  disabled={cooldown > 0 || otpMutation.isPending}
                  className="text-teal-600 font-medium hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
                <button type="button" onClick={() => setStep(3)} className="text-gray-500 hover:underline">
                  Change details
                </button>
              </div>

              <button
                type="submit"
                disabled={otp.length !== OTP_LENGTH || bookMutation.isPending}
                className="w-full bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookMutation.isPending ? "Confirming…" : "Verify & Confirm Booking"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
