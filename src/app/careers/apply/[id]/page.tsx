import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { getJob, jobs } from "@/src/lib/jobs";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = getJob(id);

  return {
    title: job
      ? `Apply for ${job.title} | Abd Hind Medicare Group`
      : "Career Application | Abd Hind Medicare Group",
    description: job?.description,
  };
}

export default async function CareerApplyPage({ params }: PageProps) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-6 py-14 text-white md:px-10">
        <Link
          href="/careers#openings"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-teal-100 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Openings
        </Link>
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-teal-100">
            <Briefcase className="h-4 w-4" />
            {job.department}
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Apply for {job.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-teal-50 md:text-lg">
            {job.description}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Role Snapshot</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { icon: MapPin, label: "Location", value: job.location },
                { icon: Clock, label: "Type", value: job.type },
                {
                  icon: GraduationCap,
                  label: "Experience",
                  value: job.experience,
                },
                { icon: Briefcase, label: "Salary", value: job.salary },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <item.icon className="mb-3 h-5 w-5 text-teal-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ListCard title="Responsibilities" items={job.responsibilities} />
            <ListCard title="Requirements" items={job.requirements} />
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Submit Application
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Send your resume with the job title in the subject line. Our HR team
            will contact shortlisted candidates for the next step.
          </p>
          <div className="mt-6 space-y-3">
            <a
              href={`mailto:info@abdhindmedicare.com?subject=Application for ${encodeURIComponent(job.title)}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <Mail className="h-4 w-4" />
              Email Resume
            </a>
            <a
              href="tel:+919540929832"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-teal-600 hover:text-teal-700"
            >
              <Phone className="h-4 w-4" />
              Call HR Desk
            </a>
          </div>
          <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-teal-800">
            Keep your resume, registration certificate if applicable, and
            experience documents ready for screening.
          </div>
        </aside>
      </section>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
