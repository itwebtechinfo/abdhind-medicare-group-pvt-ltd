import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck, ExternalLink } from "lucide-react";

export default function ContactPage() {
  // Google Maps Links
  const mapShareUrl = "https://maps.app.goo.gl/NrH1i9qxGuGAZBUNA";
  const mapEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56021.81048268618!2d77.15608384863279!3d28.6488431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfdb5515c2879%3A0x46e9e734478e124d!2sABDHIND%20MEDICARE%20GROUP%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1784794344522!5m2!1sen!2sin";

  return (
    <div className="min-h-screen bg-[#f7f9f8] px-4 py-8 text-slate-950 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Dental Clinic Active Now
          </div>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">
            Contact Abd Hind Medicare
          </h1>
          <p className="mt-5 max-w-3xl leading-8 text-slate-600">
            Book active dental appointments, ask about treatment plans, or join the waitlist for upcoming hospital specialties.
          </p>
        </section>

        {/* Contact Cards Grid */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { icon: Phone, title: "Appointments", text: "+91 95409 29832", href: "tel:+919540929832", isExternal: false },
            { icon: Mail, title: "Email", text: "info@abdhindmedicare.com", href: "mailto:info@abdhindmedicare.com", isExternal: false },
            { icon: MapPin, title: "Clinic", text: "Jama Masjid, New Delhi 110006", href: mapShareUrl, isExternal: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                target={item.isExternal ? "_blank" : "_self"}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className="group rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-emerald-200"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold">{item.title}</h2>
                  {item.isExternal && (
                    <ExternalLink className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-600" />
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </Link>
            );
          })}
        </section>

        {/* Working Hours & CTA Section */}
        {/* <section className="mt-6 rounded-[24px] border border-emerald-100 bg-emerald-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <Clock className="mt-1 h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <h2 className="font-extrabold text-slate-950">Dental clinic hours</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Monday to Saturday, 11:30 AM to 8:30 PM. Other specialties are coming soon.
                </p>
              </div>
            </div>
            <Link
              href="/book-appointment"
              className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-center text-sm font-bold text-white transition hover:opacity-95 shrink-0"
            >
              Book Dental Appointment
            </Link>
          </div>
        </section> */}

        {/* Integrated Google Maps Section */}
        <section className="mt-6 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <MapPin className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Our Location</span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                Find Us on Google Maps
              </h2>
            </div>
            <a
              href={mapShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              Open in Google Maps App
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Map Embed Iframe Container */}
          <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="ABDHIND MEDICARE GROUP Location"
              className="w-full h-full"
            ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
}