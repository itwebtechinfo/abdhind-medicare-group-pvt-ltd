export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
};

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Cardiologist",
    department: "Medical",
    location: "Delhi - Main Clinic, Sector 44, Near Metro Station, Noida - 201301",
    type: "Full-time",
    experience: "5-10 years",
    salary: "Competitive",
    description:
      "Lead outpatient and inpatient cardiology services with a patient-first approach across Abd Hind Medicare Group facilities.",
    responsibilities: [
      "Diagnose and manage acute and chronic cardiac conditions",
      "Coordinate cardiac procedures with the clinical team",
      "Mentor junior doctors and support quality audits",
    ],
    requirements: [
      "MD Medicine with DM or DNB Cardiology",
      "Valid medical registration",
      "Strong communication and clinical leadership skills",
    ],
  },
  {
    id: "2",
    title: "Staff Nurse - ICU",
    department: "Nursing",
    location: "Kushinagar Clinic, Kasia, Kushinagar, Uttar Pradesh - 274402",
    type: "Full-time",
    experience: "2-5 years",
    salary: "Rs. 30,000 - Rs. 50,000/month",
    description:
      "Provide attentive critical care nursing support in a protocol-led ICU environment.",
    responsibilities: [
      "Monitor vitals and support critical care workflows",
      "Administer medication as prescribed",
      "Maintain accurate patient records and family communication",
    ],
    requirements: [
      "B.Sc Nursing or GNM qualification",
      "Active nursing council registration",
      "ICU experience and BLS/ACLS training preferred",
    ],
  },
  {
    id: "3",
    title: "Orthopedic Surgeon",
    department: "Medical",
    location: "Delhi - Main Clinic, Sector 44, Near Metro Station, Noida - 201301",
    type: "Full-time",
    experience: "8-12 years",
    salary: "Best in industry",
    description:
      "Join a growing orthopedic service focused on joint care, trauma, and rehabilitation continuity.",
    responsibilities: [
      "Consult and treat orthopedic patients",
      "Perform surgeries according to clinical scope",
      "Coordinate with physiotherapy and diagnostics teams",
    ],
    requirements: [
      "MS or DNB Orthopedics",
      "Surgical experience in trauma or joint replacement",
      "Patient-focused communication style",
    ],
  },
  {
    id: "4",
    title: "Hospital Administrator",
    department: "Administration",
    location: "Delhi - Main Clinic, Sector 44, Near Metro Station, Noida - 201301",
    type: "Full-time",
    experience: "7-10 years",
    salary: "Rs. 1,50,000 - Rs. 2,00,000/month",
    description:
      "Manage daily hospital operations, patient experience, compliance, and department coordination.",
    responsibilities: [
      "Oversee operations, staffing, and patient flow",
      "Track budgets, vendor coordination, and reporting",
      "Support quality, safety, and regulatory compliance",
    ],
    requirements: [
      "MBA or MHA in Healthcare Management",
      "Hospital operations experience",
      "Strong leadership and process improvement skills",
    ],
  },
  {
    id: "5",
    title: "Radiologist",
    department: "Medical",
    location: "Kushinagar Clinic, Kasia, Kushinagar, Uttar Pradesh - 274402",
    type: "Full-time",
    experience: "3-7 years",
    salary: "Rs. 1,80,000 - Rs. 2,50,000/month",
    description:
      "Support diagnostic excellence through accurate imaging interpretation and clinician collaboration.",
    responsibilities: [
      "Interpret radiology images and prepare reports",
      "Guide ultrasound and imaging procedures",
      "Coordinate with physicians for urgent findings",
    ],
    requirements: [
      "MD or DNB Radiology",
      "Valid medical registration",
      "High attention to detail and reporting quality",
    ],
  },
  {
    id: "6",
    title: "Front Desk Executive",
    department: "Support Staff",
    location: "Kushinagar Clinic, Kasia, Kushinagar, Uttar Pradesh - 274402",
    type: "Full-time",
    experience: "1-3 years",
    salary: "Rs. 20,000 - Rs. 30,000/month",
    description:
      "Be the first point of contact for patients and support smooth appointment, billing, and enquiry workflows.",
    responsibilities: [
      "Welcome patients and manage appointments",
      "Handle phone, WhatsApp, and walk-in enquiries",
      "Maintain patient records and billing coordination",
    ],
    requirements: [
      "Graduate degree preferred",
      "Good computer and communication skills",
      "Healthcare front office experience preferred",
    ],
  },
];

export function getJob(id: string) {
  return jobs.find((job) => job.id === id);
}
