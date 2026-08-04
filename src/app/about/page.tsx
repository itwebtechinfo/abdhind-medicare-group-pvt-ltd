import type { Metadata } from "next";
import {
  CheckCircle2,
  Stethoscope,
  Building2,
  Microscope,
  Pill,
  Leaf,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Abd Hind Medicare Group",
  description:
    "Abd Hind MediCare Group Pvt. Ltd. is a founder-led healthcare organization building an integrated healthcare ecosystem — dental care, multi-speciality healthcare, diagnostics, pharmacy, and healthcare products.",
};

const coreValues = [
  {
    emoji: "❤️",
    title: "Compassion",
    desc: "We treat every patient with empathy, dignity, and respect because healthcare begins with humanity.",
  },
  {
    emoji: "🤝",
    title: "Integrity",
    desc: "Honest advice, ethical medical practices, and complete transparency are the foundation of every decision we make.",
  },
  {
    emoji: "🏥",
    title: "Clinical Excellence",
    desc: "We are committed to evidence-based treatments, continuous learning, and the highest standards of medical care.",
  },
  {
    emoji: "💡",
    title: "Innovation",
    desc: "Healthcare is constantly evolving. We embrace new technologies and innovative solutions to improve patient outcomes.",
  },
  {
    emoji: "🛡",
    title: "Patient-First Care",
    desc: "Every treatment plan is personalised with the comfort, safety, and long-term well-being of our patients in mind.",
  },
  {
    emoji: "🌱",
    title: "Responsibility",
    desc: "We strive to create a healthier society by promoting awareness, preventive care, and sustainable healthcare practices.",
  },
];

const ecosystem = [
  {
    icon: Stethoscope,
    title: "MR Dental Clinic",
    accent: "#059669",
    bg: "#f0fdf4",
    desc: "Our flagship dental centre provides comprehensive dental care for all age groups, including advanced dentistry, regenerative dentistry, dental implants, cosmetic dentistry, root canal treatment, orthodontics, smile design, preventive care, and Pediatric (Child) Dentistry with gentle, child-friendly care in a comfortable environment.",
  },
  {
    icon: Building2,
    title: "Multi-Speciality Healthcare",
    accent: "#7c3aed",
    bg: "#faf5ff",
    desc: "A future-ready healthcare centre bringing together physicians, paediatricians, gynaecologists, ENT specialists, dermatologists, ophthalmologists, orthopaedic and cardiology specialists, and other medical experts under one roof.",
  },
  {
    icon: Microscope,
    title: "Diagnostic Services",
    accent: "#0891b2",
    bg: "#f0f9ff",
    desc: "Modern pathology and diagnostic solutions delivering fast, accurate, and reliable reports using advanced laboratory technology.",
  },
  {
    icon: Pill,
    title: "Pharmacy Services",
    accent: "#2563eb",
    bg: "#eff6ff",
    desc: "A trusted pharmacy network offering genuine medicines, digital prescriptions, healthcare essentials, and convenient patient support.",
  },
  {
    icon: Leaf,
    title: "Healthcare Products & Manufacturing",
    accent: "#16a34a",
    bg: "#f0fdf4",
    desc: "Research-driven healthcare and oral care products developed with quality, safety, innovation, and sustainability in mind.",
  },
];

const leadership = [
  {
    name: "Dr. Ekhlaq Ahmed",
    role: "Founder & Director | Lead Dental Surgeon",
    qualification: "BDS – Jamia Millia Islamia (Central University)",
    bio: "With over 10+ years of clinical experience, Dr. Ekhlaq Ahmed has dedicated his career to delivering modern, minimally invasive, and regenerative dental care. Through MR Dental Clinic, he has successfully transformed thousands of smiles while earning the trust of patients through ethical practice, transparency, and clinical excellence. His vision extends beyond dentistry. As the Founder of Abd Hind MediCare Group Pvt. Ltd., he is leading the development of an integrated healthcare ecosystem that combines compassionate care, advanced technology, innovation, and multidisciplinary healthcare services under one trusted organization.",
  },
  {
    name: "Mohd. Ashfaque",
    role: "Director",
    qualification: "PG | Marketing & Business Development",
    bio: "With over 2+ years of experience in marketing and business development, Mohd. Ashfaque plays a key role in driving the company's product strategy, brand development, and market expansion. He oversees product planning, marketing initiatives, and business growth while ensuring that healthcare solutions effectively reach the people who need them. Inspired by a shared vision to build a modern healthcare organization, he joined hands in establishing Abd Hind MediCare Group Pvt. Ltd. after transitioning from the family's previous business. His focus is on creating innovative healthcare products, strengthening the brand, and contributing to the company's long-term growth and expansion.",
  },
  {
    name: "Dr. Rashiqa",
    role: "Chief Executive Officer (CEO)",
    qualification: "BDS (Dental Surgeon)",
    bio: "With over 5+ years of clinical experience, Dr. Rashiqa serves as the Chief Executive Officer (CEO) of Abd Hind MediCare Group Pvt. Ltd., leading the organization's strategic growth, clinical operations, and patient care excellence. She oversees healthcare administration, quality assurance, operational efficiency, and the implementation of patient-centric healthcare standards across the organization. Committed to innovation, ethical healthcare, and continuous improvement, Dr. Rashiqa plays a vital role in strengthening the group's vision of building an integrated healthcare ecosystem that delivers high-quality, accessible, and compassionate medical services for every patient.",
  },
];

const whyChooseUs = [
  "Founder-led healthcare backed by clinical expertise.",
  "Patient-first approach in every healthcare service.",
  "Ethical, transparent, and evidence-based treatment.",
  "Experienced healthcare professionals.",
  "Advanced technology and modern infrastructure.",
  "Strict safety, sterilisation, and quality protocols.",
  "Affordable and accessible healthcare solutions.",
  "Continuous innovation for better patient outcomes.",
  "Integrated healthcare ecosystem under one trusted brand.",
];

const missionPoints = [
  "Deliver exceptional healthcare with compassion, integrity, and professionalism.",
  "Build an integrated healthcare ecosystem under one trusted brand.",
  "Make advanced medical services accessible and affordable.",
  "Promote preventive healthcare and long-term wellness.",
  "Adopt modern technologies that improve diagnosis, treatment, and patient outcomes.",
  "Maintain transparency, ethics, and trust in every patient interaction.",
  "Continuously innovate to meet the evolving healthcare needs of society.",
];

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mb-10 text-center">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <div className="mx-auto mt-4 h-1 w-11 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            About Abd Hind MediCare Group Pvt. Ltd.
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Building a Healthier Tomorrow
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
            Abd Hind MediCare Group Pvt. Ltd. is a founder-led healthcare
            organization committed to delivering ethical, affordable, and
            patient-first healthcare. Our vision is to build an integrated
            healthcare ecosystem where individuals and families can access
            quality medical services under one trusted brand.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Starting with advanced dental care through MR Dental Clinic, our
            journey has expanded toward creating a comprehensive healthcare
            network that includes multi-speciality healthcare, diagnostics,
            pharmacy, healthcare products, and future medical innovations.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            At Abd Hind MediCare, we believe that healthcare is not just
            about treating illnesses—it is about improving lives through
            compassion, innovation, trust, and clinical excellence.
          </p>
          <blockquote className="mx-auto mt-8 max-w-xl rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-5 text-sm font-semibold italic text-emerald-800 sm:text-base">
            &ldquo;Your Problem, Our Care — Restoring Natural Health with
            Satisfaction.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Our Journey" title="Our Story" />
          <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            <p className="text-center font-medium text-slate-800">
              Every meaningful journey begins with a vision.
            </p>
            <p>
              The foundation of Abd Hind MediCare Group Pvt. Ltd. was
              inspired by the vision of my father, who always believed that
              patients should be able to access complete healthcare services
              under one roof. His dream was to create a healthcare ecosystem
              where people could receive trusted, ethical, and high-quality
              treatment without the need to visit multiple healthcare
              providers.
            </p>
            <p>
              Turning that vision into reality began with the establishment
              of MR Dental Clinic in 2017. Under the leadership of Dr.
              Ekhlaq Ahmed, the clinic was built on the principles of
              clinical excellence, transparency, patient-first care, and
              trust. Over the years, MR Dental Clinic earned the confidence
              of thousands of patients and became a strong foundation for
              something much bigger.
            </p>
            <p>
              After successfully establishing and growing MR Dental Clinic,
              we took the next step towards fulfilling my father&apos;s
              vision. In 2026, Abd Hind MediCare Group Pvt. Ltd. was founded
              with the mission of creating an integrated healthcare
              organization that brings together clinical care, diagnostics,
              pharmacy, healthcare products, and future medical innovations
              under one trusted brand.
            </p>
            <p>
              Today, every milestone we achieve is a tribute to that
              original vision. As we continue to grow, our commitment
              remains the same—to make quality healthcare more accessible,
              compassionate, and trustworthy while building a healthier
              future for every family we serve.
            </p>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm font-semibold italic text-emerald-700 sm:text-base">
            &ldquo;One Vision. One Trusted Healthcare Ecosystem. One
            Commitment to Better Lives.&rdquo;
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title="Who We Are" />
          <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            <p>
              Abd Hind MediCare Group is more than a healthcare company—we
              are building a future-ready healthcare ecosystem designed
              around the complete well-being of every patient.
            </p>
            <p>
              Our goal is to integrate preventive care, clinical treatment,
              diagnostics, pharmacy, healthcare products, and future medical
              innovations into one seamless healthcare experience. Every
              service we provide is guided by evidence-based medicine,
              ethical clinical practices, modern technology, and a
              patient-first philosophy.
            </p>
          </div>
          <p className="mt-6 text-sm font-semibold text-slate-800">
            Today, our ecosystem includes:
          </p>
          <ul className="mt-4 space-y-3">
            {[
              [
                "MR Dental Clinic",
                "Advanced Dental Care (Established 2017)",
              ],
              ["Multi-Speciality Healthcare", "Launching Soon"],
              ["Diagnostic Services", "Coming Soon"],
              ["Pharmacy Services", "Under Development"],
              ["Healthcare Products & Manufacturing", "Future Expansion"],
            ].map(([name, status]) => (
              <li
                key={name}
                className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-semibold text-slate-800">
                  {name}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {status}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
            As we continue to grow, our focus remains unchanged—providing
            trusted, accessible, and high-quality healthcare for every stage
            of life.
          </p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-900">
              Our Vision
            </h3>
            <div className="mt-3 h-1 w-11 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              To become one of India&apos;s most trusted integrated
              healthcare groups by delivering ethical, accessible,
              technology-driven, and patient-centred healthcare while
              improving lives through innovation, compassion, and clinical
              excellence.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-900">
              Our Mission
            </h3>
            <div className="mt-3 h-1 w-11 rounded-full bg-gradient-to-r from-blue-500 to-blue-300" />
            <ul className="mt-4 space-y-2.5">
              {missionPoints.map((point) => (
                <li
                  key={point}
                  className="flex gap-2 text-sm leading-relaxed text-slate-600 sm:text-base"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title="Our Core Values" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-2xl">{value.emoji}</span>
                <h3 className="mt-3 text-base font-bold text-slate-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEALTHCARE ECOSYSTEM */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title="Our Healthcare Ecosystem" />
          <p className="mx-auto -mt-4 mb-10 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            Our vision is to create a comprehensive healthcare network that
            addresses every aspect of a patient&apos;s healthcare journey.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystem.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: item.bg }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: item.accent }}
                  />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title="Leadership" />
          <div className="grid gap-6 lg:grid-cols-3">
            {leadership.map((leader) => (
              <div
                key={leader.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">
                  {leader.name
                    .replace(/^Dr\.\s*/, "")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {leader.name}
                </h3>
                <p className="text-sm font-semibold text-emerald-600">
                  {leader.role}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {leader.qualification}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {leader.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="Why Choose Abd Hind MediCare?" />
          <div className="grid gap-3 sm:grid-cols-2">
            {whyChooseUs.map((point) => (
              <div
                key={point}
                className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm leading-relaxed text-slate-700">
                  {point}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm font-semibold text-emerald-700">
            🌿 Focused on preserving your natural health.
          </p>
        </div>
      </section>

      {/* QUALITY */}
      <section className="bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading title="Our Commitment to Quality" />
          <p className="text-sm font-medium text-slate-800">
            Quality is the foundation of everything we do.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            From clinical care and diagnostics to healthcare products and
            patient support, we follow internationally accepted standards,
            evidence-based practices, modern sterilisation protocols, and
            continuous quality improvement to ensure safe, reliable, and
            effective healthcare for every patient.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            We believe that trust is earned through consistency,
            responsibility, and an unwavering commitment to excellence.
          </p>
        </div>
      </section>

      {/* LOOKING AHEAD */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading title="Looking Ahead" />
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Healthcare is evolving rapidly, and Abd Hind MediCare Group is
            committed to growing responsibly with the changing needs of
            society.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Our long-term vision is to expand into multi-speciality
            hospitals, advanced diagnostic centres, digital healthcare,
            telemedicine, healthcare manufacturing, preventive healthcare
            programmes, research, and innovative medical technologies that
            improve lives across India.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Every new initiative is driven by the same purpose that inspired
            our journey—to build a healthcare ecosystem where quality
            treatment, compassion, and trust are available under one roof.
          </p>
        </div>
      </section>

      {/* PROMISE */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-500 px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
            Our Promise
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
            One Vision. One Trusted Healthcare Ecosystem. One Commitment to
            Better Lives.
          </h2>
          <p className="mt-4 text-sm font-semibold text-emerald-50 sm:text-base">
            Abd Hind MediCare Group Pvt. Ltd. — Building a Healthier
            Tomorrow.
          </p>
        </div>
      </section>
    </div>
  );
}
