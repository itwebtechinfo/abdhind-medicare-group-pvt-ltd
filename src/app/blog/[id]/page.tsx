import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageCircle,
  Smile,
  Tag,
  User,
} from "lucide-react";
import { blogPosts, getBlogPost } from "@/src/lib/blog-posts";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogPost(id);

  if (!post) {
    return {
      title: "Blog Article | Abd Hind Medicare Group",
    };
  }

  return {
    title: `${post.title} | Abd Hind Medicare Group`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = getBlogPost(id);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-6 py-14 text-white md:px-10">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-teal-100 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-teal-100">
            <Smile className="h-4 w-4" />
            {post.category}
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-teal-50 md:text-lg">
            {post.excerpt}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-teal-100">
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-teal-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-600">{post.authorRole}</p>
            </div>
          </div>

          <div className="space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold text-gray-900">
                  {section.heading}
                </h2>
                <p className="mt-3 text-base leading-8 text-gray-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
              >
                <Tag className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-md">
            <h2 className="text-xl font-bold">Need Dental Guidance?</h2>
            <p className="mt-2 text-sm leading-6 text-teal-50">
              Speak with the care team for consultation timing, treatment
              planning, or follow-up questions.
            </p>
            <Link
              href="/book-appointment"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-gray-100"
            >
              <MessageCircle className="h-4 w-4" />
              Book Appointment
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              More Articles
            </h2>
            <div className="space-y-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.id}`}
                  className="block rounded-xl bg-gray-50 p-4 transition hover:bg-teal-50"
                >
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {related.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {related.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
