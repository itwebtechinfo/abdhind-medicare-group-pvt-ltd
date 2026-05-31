import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Bone,
  Brain,
  Ear,
  HeartPulse,
  Microscope,
  Pill,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";

export type HospitalService = {
  slug: string;
  href: string;
  title: string;
  status: "active" | "coming-soon";
  badge: string;
  icon: LucideIcon;
  description: string;
  highlights: string[];
  doctors: string[];
};

export const hospitalServices: HospitalService[] = [
  {
    slug: "dental",
    href: "/services/dental",
    title: "Dental Clinic",
    status: "active",
    badge: "Available Now",
    icon: Smile,
    description:
      "Currently running with advanced regenerative dentistry, painless root canal treatment, zirconia crowns, dental implants, pediatric dental care, and smile design.",
    highlights: [
      "Dr. Ekhlaq Ahmed, Founder & Lead Dental Surgeon",
      "Appointments open Monday to Saturday",
      "RCT, implants, crowns, aligners, whitening and child dental care",
      "Digital X-ray planning and transparent treatment estimates",
    ],
    doctors: ["Dr. Ekhlaq Ahmed", "Dental assistant team", "Oral hygiene counsellor"],
  },
  {
    slug: "cardiology",
    href: "/doctors/cardiology",
    title: "Cardiology",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: HeartPulse,
    description:
      "A premium heart-care department is being prepared for ECG, hypertension care, preventive cardiology, and specialist consultation.",
    highlights: ["ECG desk planning", "Heart health packages", "Consultant onboarding", "Emergency referral protocol"],
    doctors: ["Consultant panel under onboarding"],
  },
  {
    slug: "orthopedics",
    href: "/doctors/orthopedics",
    title: "Orthopedics",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Bone,
    description:
      "Upcoming bone and joint care for pain management, trauma guidance, sports injuries, and physiotherapy-linked recovery.",
    highlights: ["Joint pain clinic", "Fracture support", "Physiotherapy coordination", "Imaging workflow"],
    doctors: ["Orthopedic consultant panel under onboarding"],
  },
  {
    slug: "neurology",
    href: "/doctors/neurology",
    title: "Neurology",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Brain,
    description:
      "Future neuro-care services for headache, seizure care, neuropathy, stroke follow-up, and diagnostic coordination.",
    highlights: ["Neuro OPD planning", "Imaging referral support", "Follow-up pathways", "Medication review"],
    doctors: ["Neurology consultant panel under onboarding"],
  },
  {
    slug: "pediatrics",
    href: "/doctors/pediatrics",
    title: "Pediatrics",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Baby,
    description:
      "Upcoming child-care services with vaccination planning, growth checks, parent guidance, and pediatric dental coordination.",
    highlights: ["Child-friendly OPD", "Vaccination reminders", "Growth monitoring", "Parent counselling"],
    doctors: ["Pediatric consultant panel under onboarding"],
  },
  {
    slug: "general-medicine",
    href: "/services/multi-speciality",
    title: "General Medicine",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Stethoscope,
    description:
      "A general medicine OPD is planned for fever, diabetes, hypertension, preventive health checks, and family medicine.",
    highlights: ["Primary care OPD", "Chronic care plans", "Health packages", "Referral coordination"],
    doctors: ["Physician panel under onboarding"],
  },
  {
    slug: "ent",
    href: "/services/wellness",
    title: "ENT",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Ear,
    description:
      "ENT services are planned for ear, nose, throat concerns, allergy review, hearing screening, and procedure referrals.",
    highlights: ["ENT OPD planning", "Hearing screening", "Allergy guidance", "Procedure referrals"],
    doctors: ["ENT consultant panel under onboarding"],
  },
  {
    slug: "dermatology",
    href: "/services/telemedicine",
    title: "Dermatology",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Sparkles,
    description:
      "Skin and aesthetic consultation services are planned with acne care, hair concerns, allergy review, and skin-health programs.",
    highlights: ["Skin OPD planning", "Acne and hair care", "Aesthetic consults", "Follow-up care"],
    doctors: ["Dermatology consultant panel under onboarding"],
  },
  {
    slug: "diagnostics",
    href: "/services/diagnostics",
    title: "Diagnostics",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Microscope,
    description:
      "A diagnostics wing is being prepared for pathology tests, health packages, digital reports, and home sample support.",
    highlights: ["Lab partner setup", "Digital reports", "Health packages", "Sample workflow"],
    doctors: ["Pathology partner under onboarding"],
  },
  {
    slug: "pharmacy",
    href: "/services/pharmacy",
    title: "Pharmacy",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Pill,
    description:
      "A pharmacy service is planned for authentic medicines, prescription fulfilment, refill reminders, and emergency supplies.",
    highlights: ["Prescription-linked dispensing", "Vendor onboarding", "Expiry-safe inventory", "Refill reminders"],
    doctors: ["Pharmacy team under onboarding"],
  },
  {
    slug: "insurance",
    href: "/services/insurance",
    title: "Insurance Desk",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: ShieldCheck,
    description:
      "Insurance support is planned for cashless guidance, documentation, package estimates, and claim coordination.",
    highlights: ["TPA desk planning", "Document checklist", "Package estimates", "Claim guidance"],
    doctors: ["Insurance desk under onboarding"],
  },
  {
    slug: "telemedicine",
    href: "/services/telemedicine",
    title: "Telemedicine",
    status: "coming-soon",
    badge: "Coming Soon",
    icon: Video,
    description:
      "Remote consultation workflows are planned for follow-ups, report review, prescription sharing, and patient support.",
    highlights: ["Video consult planning", "Digital prescriptions", "Report review", "Follow-up reminders"],
    doctors: ["Telemedicine desk under onboarding"],
  },
];

export function getHospitalService(slug: string) {
  return hospitalServices.find((service) => service.slug === slug) ?? hospitalServices[0];
}
