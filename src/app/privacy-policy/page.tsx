import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Ban,
  UserCheck,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Abd Hind Medicare Group",
  description:
    "Privacy Policy of Abd Hind MediCare Group Pvt. Ltd. — how we collect, use, store, and protect patient information, including data shared via our WhatsApp Business (Meta) appointment system.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const EFFECTIVE_DATE = "August 4, 2026";

const highlights = [
  {
    icon: Ban,
    title: "We never sell your data",
    desc: "Your information is never sold or shared with third-party marketing companies.",
  },
  {
    icon: Lock,
    title: "Encrypted & access-controlled",
    desc: "Patient records are stored in an encrypted database accessible only to authorized staff.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp used responsibly",
    desc: "WhatsApp Business API (Meta) is used only for appointments, reminders, and support.",
  },
  {
    icon: UserCheck,
    title: "You are in control",
    desc: "You can request access, correction, or deletion of your data at any time.",
  },
];

const toc = [
  ["introduction", "1. Introduction"],
  ["information-we-collect", "2. Information We Collect"],
  ["how-we-use", "3. How We Use Your Information"],
  ["whatsapp-meta", "4. WhatsApp / Meta Data Sharing Disclosure"],
  ["storage-security", "5. Data Storage & Security"],
  ["retention", "6. Data Retention"],
  ["your-rights", "7. Your Rights"],
  ["cookies", "8. Cookies"],
  ["children", "9. Children's Privacy"],
  ["changes", "10. Changes to This Policy"],
  ["contact", "11. Contact Us"],
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Patient Trust &amp; Data Privacy
          </div>
          <h1 className="text-4xl font-extrabold text-slate-950 md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            This Privacy Policy explains how{" "}
            <strong className="font-semibold text-slate-800">
              Abd Hind MediCare Group Pvt. Ltd.
            </strong>{" "}
            and its healthcare units — including MR Dental Clinic — collect,
            use, store, and protect your personal information, including
            information shared through our WhatsApp Business (Meta Cloud
            API) appointment system.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Effective Date: {EFFECTIVE_DATE} &nbsp;•&nbsp; Last Updated:{" "}
            {EFFECTIVE_DATE}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <h.icon className="h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-sm font-bold text-slate-900">
                  {h.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Table of contents */}
        <section className="mt-6 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] md:p-8">
          <p className="text-sm font-bold text-emerald-700">
            On this page
          </p>
          <nav className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {toc.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm text-slate-600 transition-colors hover:text-emerald-700 hover:underline"
              >
                {label}
              </a>
            ))}
          </nav>
        </section>

        {/* Sections */}
        <section className="mx-auto mt-6 max-w-4xl space-y-4">
          <PolicySection id="introduction" number="01" title="Introduction">
            <p>
              Abd Hind MediCare Group Pvt. Ltd. (&quot;Abd Hind MediCare&quot;,
              &quot;the Group&quot;, &quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) is a multidisciplinary healthcare group
              registered in India (GSTIN: 07ABFCA1118C1ZC), operating the
              website{" "}
              <a
                href="https://www.abdhindmedicare.com/"
                className="font-medium text-emerald-700 hover:underline"
              >
                www.abdhindmedicare.com
              </a>{" "}
              and multiple healthcare units and branches.
            </p>
            <p>
              One of our units is{" "}
              <strong className="font-semibold text-slate-800">
                MR Dental Clinic (Maximum Regenerative Dental Clinic)
              </strong>
              , led by Dr. Ekhlaq Ahmed (Founder &amp; Director), located at
              887, near Salam Hotel, Choori Walan, Jama Masjid, Chandni
              Chowk, New Delhi, Delhi 110006.
            </p>
            <p>
              This Privacy Policy applies to all patients and visitors who
              interact with any unit of the Abd Hind MediCare Group —
              whether through our website, in person at a clinic, or over
              WhatsApp — currently through MR Dental Clinic and, in future,
              through other healthcare units and branches of the Group. By
              using our website, visiting our clinics, or messaging us on
              WhatsApp, you agree to the practices described in this policy.
            </p>
          </PolicySection>

          <PolicySection
            id="information-we-collect"
            number="02"
            title="Information We Collect"
          >
            <p>
              When you book an appointment or communicate with us, we may
              collect the following information:
            </p>
            <ul>
              <li>Full name</li>
              <li>Age</li>
              <li>Gender</li>
              <li>Residential address</li>
              <li>WhatsApp number / mobile number</li>
              <li>Appointment date and time preferences</li>
              <li>
                Chat and message history exchanged with us over WhatsApp
              </li>
              <li>Feedback and ratings shared after your visit</li>
              <li>
                Any other appointment-related details you voluntarily share
                with our staff to help with booking or care coordination
              </li>
            </ul>
            <p>
              We only collect the information necessary to schedule
              appointments, provide support, and improve patient care. We do
              not request sensitive financial information (such as card or
              bank details) over WhatsApp or chat.
            </p>
          </PolicySection>

          <PolicySection
            id="how-we-use"
            number="03"
            title="How We Use Your Information"
          >
            <p>We use the information we collect to:</p>
            <ul>
              <li>Book, confirm, reschedule, or cancel your appointments</li>
              <li>
                Send appointment reminders (24 hours, 2 hours, and 30
                minutes before your scheduled visit)
              </li>
              <li>
                Allow our staff to reply directly to your questions and
                provide support
              </li>
              <li>
                Collect feedback and ratings after your visit to improve our
                services
              </li>
              <li>
                Coordinate care across current and future healthcare
                units/branches of the Abd Hind MediCare Group, for example
                if you visit or are referred to another unit
              </li>
              <li>
                Maintain records required for administrative, billing, and
                regulatory purposes
              </li>
            </ul>
            <p>
              We do not use your information for unrelated third-party
              marketing.
            </p>
          </PolicySection>

          <PolicySection
            id="whatsapp-meta"
            number="04"
            title="WhatsApp / Meta Data Sharing Disclosure"
          >
            <p>
              We use the WhatsApp Business Platform (Meta Cloud API),
              provided by Meta Platforms, Inc., to automate patient
              appointment booking for MR Dental Clinic and to send
              appointment-related messages.
            </p>
            <p>When you message us on WhatsApp:</p>
            <ul>
              <li>
                Your messages are transmitted through Meta&apos;s WhatsApp
                Business infrastructure
              </li>
              <li>
                Meta processes this data in accordance with the{" "}
                <a
                  href="https://www.whatsapp.com/legal/business-data-processing-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  WhatsApp Business Data Processing Terms
                </a>{" "}
                and{" "}
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Meta&apos;s Privacy Policy
                </a>
              </li>
              <li>
                We do not control how Meta processes data on its own
                platform — that is governed solely by Meta&apos;s policies
              </li>
              <li>
                We use WhatsApp strictly for appointment booking,
                confirmations, reminders, support replies, and feedback
                collection — not for unsolicited promotional messaging
              </li>
            </ul>
          </PolicySection>

          <PolicySection
            id="storage-security"
            number="05"
            title="Data Storage & Security"
          >
            <ul>
              <li>
                Patient information is stored in an encrypted database
              </li>
              <li>
                Access is restricted to authorized staff who need the
                information to provide care or support
              </li>
              <li>
                We apply reasonable technical and organizational safeguards
                to protect your data from unauthorized access, loss, or
                misuse
              </li>
            </ul>
            <p>
              While we take reasonable steps to protect your information, no
              method of electronic storage or transmission is 100% secure.
            </p>
          </PolicySection>

          <PolicySection id="retention" number="06" title="Data Retention">
            <p>
              We retain your personal information for as long as necessary
              to fulfil the purposes described in this policy — including
              appointment management, care continuity, and any legal,
              medical record-keeping, or regulatory requirements. When
              information is no longer needed, we take reasonable steps to
              delete or anonymize it.
            </p>
          </PolicySection>

          <PolicySection id="your-rights" number="07" title="Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>
                Request access to the personal information we hold about
                you
              </li>
              <li>Request correction of inaccurate or outdated information</li>
              <li>
                Request deletion of your personal information, subject to
                any legal or medical record-keeping obligations
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the
              details in the{" "}
              <a
                href="#contact"
                className="font-medium text-emerald-700 hover:underline"
              >
                Contact Us
              </a>{" "}
              section below.
            </p>
          </PolicySection>

          <PolicySection id="cookies" number="08" title="Cookies">
            <p>
              Our website may use cookies and similar technologies to keep
              the site functional, remember your preferences, and understand
              how visitors use our website. You can control or disable
              cookies through your browser settings; doing so may affect
              some website features.
            </p>
          </PolicySection>

          <PolicySection
            id="children"
            number="09"
            title="Children's Privacy"
          >
            <p>
              Some of our healthcare units, including MR Dental Clinic, may
              provide treatment to minors. Where information about a minor
              patient is collected, it is collected with the consent and
              involvement of a parent or legal guardian. Parents/guardians
              are responsible for the accuracy of information provided on
              behalf of a minor and for any consent given for
              communication, including via WhatsApp.
            </p>
          </PolicySection>

          <PolicySection
            id="changes"
            number="10"
            title="Changes to This Policy"
          >
            <p>
              We may update this Privacy Policy from time to time to
              reflect changes in our practices, services, or legal
              requirements. Any changes will be posted on this page with a
              revised &quot;Last Updated&quot; date. We encourage you to
              review this page periodically.
            </p>
          </PolicySection>

          <PolicySection id="contact" number="11" title="Contact Us">
            <p>
              If you have any questions about this Privacy Policy or how
              your information is handled, please contact us:
            </p>
            <ul className="!list-none !pl-0">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                <span>
                  Abd Hind MediCare Group Pvt. Ltd. — 887, near Salam Hotel,
                  Choori Walan, Jama Masjid, Chandni Chowk, New Delhi, Delhi
                  110006
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-emerald-700" />
                <a
                  href="tel:+919540929800"
                  className="hover:text-emerald-700 hover:underline"
                >
                  +91 95409 29800
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-emerald-700" />
                <a
                  href="mailto:info@abdhindmedicare.com"
                  className="hover:text-emerald-700 hover:underline"
                >
                  info@abdhindmedicare.com
                </a>
              </li>
            </ul>
          </PolicySection>

          <p className="px-1 pb-2 text-center text-xs text-slate-400">
            This page is also available at{" "}
            <Link href="/privacy-policy" className="hover:underline">
              abdhindmedicare.com/privacy-policy
            </Link>{" "}
            for WhatsApp Business / Meta verification purposes.
          </p>
        </section>
      </div>
    </div>
  );
}

function PolicySection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-28 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] md:p-8"
    >
      <p className="text-sm font-bold text-emerald-700">{number}</p>
      <h2 className="mt-1 text-xl font-extrabold text-slate-950 md:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-7 text-slate-700 [&_a]:break-words [&_li]:leading-7 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
