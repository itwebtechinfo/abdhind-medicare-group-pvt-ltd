"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head"; // Added for SEO
import {
  Calendar,
  User,
  Clock,
  Heart,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  Baby,
  Microscope,
  Pill,
  Activity,
  TrendingUp,
  ChevronRight,
  Search,
  ChevronLeft,
  Share2,
  Bookmark,
  MessageCircle,
  Eye as EyeIcon,
  Tag,
  ArrowRight,
  Sparkles,
  Droplet,
  Apple,
  Dumbbell,
  Shield,
  Award,
  Users,
  Smile // Added for dental relevance
} from "lucide-react";

// Sample blog categories - Updated for Dental Clinic
const categories = [
  { name: "All", count: 24, icon: <Activity className="w-4 h-4" /> },
  { name: "Smile Makeover", count: 8, icon: <Smile className="w-4 h-4" /> },
  { name: "Root Canal (RCT)", count: 5, icon: <Shield className="w-4 h-4" /> },
  { name: "Dental Implants", count: 4, icon: <Award className="w-4 h-4" /> },
  { name: "Pediatric Dentistry", count: 3, icon: <Baby className="w-4 h-4" /> },
  { name: "Gum Treatment", count: 2, icon: <Heart className="w-4 h-4" /> },
  { name: "Dental Hygiene", count: 2, icon: <Droplet className="w-4 h-4" /> },
];

// Sample blog posts - Updated content based on reference MR Dental Clinic
const allPosts = [
  {
    id: 1,
    title: "What is Regenerative Dentistry? Saving Your Natural Teeth",
    excerpt: "Discover how regenerative dentistry techniques can save your natural teeth and promote healing without extraction.",
    content: "Regenerative dentistry is a revolutionary approach that focuses on preserving natural teeth...",
    category: "Smile Makeover",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "April 15, 2026",
    readTime: "6 min read",
    views: 2450,
    comments: 18,
    image: "/blog/regenerative-dentistry.jpg",
    featured: true,
    tags: ["Regenerative Dentistry", "Save Teeth", "Natural Healing"]
  },
  {
    id: 2,
    title: "Painless Root Canal Treatment: Myths vs. Facts",
    excerpt: "Modern RCT is comfortable and pain-free. Learn the truth about root canal procedures at MR Dental Clinic.",
    category: "Root Canal (RCT)",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "April 10, 2026",
    readTime: "5 min read",
    views: 1890,
    comments: 12,
    image: "/blog/root-canal-myths.jpg",
    featured: false,
    tags: ["Root Canal", "Painless Dentistry", "RCT"]
  },
  {
    id: 3,
    title: "Zirconia Crowns vs. Traditional Crowns: Which is Better?",
    excerpt: "A comprehensive comparison of zirconia crowns and traditional options for strength and aesthetics.",
    category: "Smile Makeover",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "April 5, 2026",
    readTime: "7 min read",
    views: 2120,
    comments: 22,
    image: "/blog/zirconia-crowns.jpg",
    featured: true,
    tags: ["Zirconia Crown", "Cosmetic Dentistry", "Smile Design"]
  },
  {
    id: 4,
    title: "Dental Implants: A Permanent Solution for Missing Teeth",
    excerpt: "Learn about the benefits of dental implants and why they are the gold standard for tooth replacement.",
    category: "Dental Implants",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "March 28, 2026",
    readTime: "8 min read",
    views: 3410,
    comments: 28,
    image: "/blog/dental-implants-guide.jpg",
    featured: false,
    tags: ["Dental Implants", "Tooth Replacement", "Oral Surgery"]
  },
  {
    id: 5,
    title: "Child's First Dental Visit: Age, Preparation, and What to Expect",
    excerpt: "A complete guide for parents to ensure a positive first dental experience for their children.",
    category: "Pediatric Dentistry",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "March 20, 2026",
    readTime: "5 min read",
    views: 1780,
    comments: 15,
    image: "/blog/first-dental-visit.jpg",
    featured: false,
    tags: ["Pediatric Dentistry", "Child Dental Care", "Parenting Tips"]
  },
  {
    id: 6,
    title: "Gum Disease: Early Signs You Should Never Ignore",
    excerpt: "Bleeding gums and bad breath could be warning signs. Learn to protect your gums for better overall health.",
    category: "Gum Treatment",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "March 15, 2026",
    readTime: "6 min read",
    views: 1340,
    comments: 9,
    image: "/blog/gum-disease-signs.jpg",
    featured: false,
    tags: ["Gum Health", "Periodontics", "Prevention"]
  }
];

// Popular tags - Updated for Dental
const popularTags = [
  "Regenerative Dentistry", "Root Canal", "Zirconia Crown", 
  "Dental Implants", "Smile Makeover", "Child Dentistry",
  "Gum Treatment", "Painless Dentistry", "Oral Hygiene"
];

// Recent posts for sidebar
const recentPosts = allPosts.slice(0, 4);

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Filter posts based on category and search
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const featuredPosts = allPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* SEO Optimization */}
      <Head>
        <title>Dental Health Blog | Tips from Best Dentist in Delhi | MR Dental Clinic</title>
        <meta
          name="description"
          content="Expert dental advice from Dr. Ekhlaq Ahmed. Learn about dental implants, root canals, smile makeovers, and regenerative dentistry in Delhi."
        />
        <meta
          name="keywords"
          content="dental blog delhi, root canal tips, smile makeover guide, dental implants advice, dr ekhlaq ahmed blog, regenerative dentistry articles"
        />
        <meta name="author" content="Dr. Ekhlaq Ahmed | MR Dental Clinic" />
        <link rel="canonical" href="https://www.mrdentalclinic.com/blog" />
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
              <span className="text-sm font-medium">Dental Insights & Oral Care Tips</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Expert Advice on
              <span className="text-teal-300"> Dental Health</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Trusted guidance from Dr. Ekhlaq Ahmed on regenerative dentistry, 
              smile makeovers, and maintaining a healthy smile for life.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search dental topics, treatments, or tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-14 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-lg"
              />
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Blog Posts Section */}
          <div className="lg:w-2/3">
            {/* Featured Posts Carousel */}
            {featuredPosts.length > 0 && searchQuery === "" && selectedCategory === "All" && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-teal-600" />
                  Featured Dental Articles
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Smile className="w-16 h-16 text-teal-300" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-teal-600 text-white text-xs px-3 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{post.author}</p>
                              <p className="text-xs text-gray-500">{post.authorRole}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-teal-600 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts Grid */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory === "All" ? "Latest Dental Articles" : `${selectedCategory} Articles`}
                </h2>
                <p className="text-sm text-gray-500">
                  Showing {currentPosts.length} of {filteredPosts.length} posts
                </p>
              </div>

              {currentPosts.length > 0 ? (
                <div className="space-y-8">
                  {currentPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <div className="relative h-48 md:h-full bg-gradient-to-br from-teal-50 to-blue-50 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {post.category === "Smile Makeover" && <Smile className="w-12 h-12 text-teal-300" />}
                              {post.category === "Root Canal (RCT)" && <Shield className="w-12 h-12 text-teal-300" />}
                              {post.category === "Dental Implants" && <Award className="w-12 h-12 text-teal-300" />}
                              {post.category === "Pediatric Dentistry" && <Baby className="w-12 h-12 text-teal-300" />}
                              {post.category === "Gum Treatment" && <Heart className="w-12 h-12 text-teal-300" />}
                              {post.category === "Dental Hygiene" && <Droplet className="w-12 h-12 text-teal-300" />}
                            </div>
                            <div className="absolute top-4 left-4">
                              <span className="bg-teal-600 text-white text-xs px-3 py-1 rounded-full">
                                {post.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-3 h-3" />
                              {post.views.toLocaleString()} views
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.comments} comments
                            </span>
                          </div>
                          <Link href={`/blog/${post.id}`}>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{post.author}</p>
                                <p className="text-xs text-gray-500">{post.authorRole}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                                <Bookmark className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                                <Share2 className="w-4 h-4 text-gray-500" />
                              </button>
                              <Link
                                href={`/blog/${post.id}`}
                                className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all"
                              >
                                Read More
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${
                        currentPage === i + 1
                          ? "bg-teal-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" />
                Dental Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      selectedCategory === category.name
                        ? "bg-teal-50 text-teal-700"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {category.icon}
                      {category.name}
                    </span>
                    <span className={`text-sm ${
                      selectedCategory === category.name
                        ? "text-teal-600 font-semibold"
                        : "text-gray-400"
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Recent Dental Posts
              </h3>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="flex gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex-shrink-0 flex items-center justify-center">
                      <Smile className="w-6 h-6 text-teal-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Popular Dental Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-700 rounded-lg text-sm transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-md">
              <h3 className="text-lg font-bold mb-2">Smile Care Newsletter</h3>
              <p className="text-sm text-teal-100 mb-4">
                Get expert dental tips and exclusive offers from MR Dental Clinic
              </p>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 rounded-xl text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <button className="w-full bg-white text-teal-700 py-2 rounded-xl font-semibold hover:bg-gray-100 transition">
                Subscribe
              </button>
              <p className="text-xs text-teal-100 mt-3 text-center">
                No spam, unsubscribe anytime
              </p>
            </div>

            {/* Ad Space / CTA */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border-2 border-yellow-200">
              <Smile className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Need a Dental Checkup?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Consult with Dr. Ekhlaq Ahmed today
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-700 transition"
              >
                Book Appointment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}