"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  Shield,
  Calendar,
  Mail,
  Phone,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Building2,
  Smile,
  Coffee,
  Gift,
  Home,
  Laptop,
  BookOpen,
  Target,
  Eye,
  Globe,
  Star,
  ArrowRight,
  Filter,
  Search,
  X,
  UserPlus,
  FileText,
  MessageCircle,
  ThumbsUp,
  Zap,
  Battery,
  Brain,
  Activity
} from "lucide-react";

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const departments = [
    { name: "All Departments", value: "all", count: 24 },
    { name: "Medical", value: "medical", count: 12 },
    { name: "Nursing", value: "nursing", count: 6 },
    { name: "Administration", value: "admin", count: 3 },
    { name: "Technology", value: "tech", count: 2 },
    { name: "Support Staff", value: "support", count: 1 }
  ];

  const jobs = [
    {
      id: 1,
      title: "Senior Cardiologist",
      department: "medical",
      location: "Delhi NCR",
      type: "Full-time",
      experience: "5-10 years",
      salary: "Competitive",
      posted: "2 days ago",
      description: "We are seeking an experienced cardiologist to join our team of heart specialists. The ideal candidate will have expertise in interventional cardiology and patient care.",
      responsibilities: [
        "Diagnose and treat various heart conditions",
        "Perform cardiac procedures and surgeries",
        "Lead the cardiology department",
        "Mentor junior doctors",
        "Participate in research and clinical trials"
      ],
      requirements: [
        "MD in Cardiology",
        "DM/DNB in Cardiology",
        "5+ years of experience",
        "Valid medical license",
        "Excellent communication skills"
      ],
      benefits: [
        "Competitive salary package",
        "Health insurance",
        "Professional development opportunities",
        "Research grants",
        "Flexible schedule"
      ]
    },
    {
      id: 2,
      title: "Staff Nurse - ICU",
      department: "nursing",
      location: "Mumbai",
      type: "Full-time",
      experience: "2-5 years",
      salary: "₹30,000 - ₹50,000/month",
      posted: "3 days ago",
      description: "Looking for dedicated ICU nurses to provide critical care to patients. Must be compassionate and skilled in emergency procedures.",
      responsibilities: [
        "Monitor patient vital signs",
        "Administer medications",
        "Assist doctors during procedures",
        "Maintain patient records",
        "Provide emotional support to families"
      ],
      requirements: [
        "B.Sc Nursing degree",
        "Valid nursing license",
        "ICU experience preferred",
        "BLS/ACLS certification",
        "Strong attention to detail"
      ],
      benefits: [
        "Competitive salary",
        "Night shift allowances",
        "Health insurance",
        "Annual bonus",
        "Career growth opportunities"
      ]
    },
    {
      id: 3,
      title: "Orthopedic Surgeon",
      department: "medical",
      location: "Bangalore",
      type: "Full-time",
      experience: "8-12 years",
      salary: "Best in industry",
      posted: "5 days ago",
      description: "Join our orthopedic team specializing in joint replacement and sports medicine. State-of-the-art facilities and supportive environment.",
      responsibilities: [
        "Perform orthopedic surgeries",
        "Consult with patients",
        "Develop treatment plans",
        "Supervise rehabilitation",
        "Conduct research"
      ],
      requirements: [
        "MS in Orthopedics",
        "MCh in Orthopedics preferred",
        "8+ years experience",
        "Board certified",
        "Research publications preferred"
      ],
      benefits: [
        "Lucrative compensation",
        "Modern equipment",
        "Research support",
        "International conferences",
        "Housing allowance"
      ]
    },
    {
      id: 4,
      title: "Hospital Administrator",
      department: "admin",
      location: "Delhi NCR",
      type: "Full-time",
      experience: "7-10 years",
      salary: "₹1,50,000 - ₹2,00,000/month",
      posted: "1 week ago",
      description: "Seeking experienced hospital administrator to manage daily operations, improve efficiency, and ensure quality patient care.",
      responsibilities: [
        "Oversee hospital operations",
        "Manage budgets and resources",
        "Implement policies",
        "Coordinate with department heads",
        "Ensure regulatory compliance"
      ],
      requirements: [
        "MBA in Healthcare Management",
        "7+ years experience",
        "Leadership skills",
        "Knowledge of hospital software",
        "Strong communication"
      ],
      benefits: [
        "Executive benefits",
        "Performance bonus",
        "Company car",
        "Health coverage",
        "Retirement plan"
      ]
    },
    {
      id: 5,
      title: "Radiologist",
      department: "medical",
      location: "Chennai",
      type: "Full-time",
      experience: "3-7 years",
      salary: "₹1,80,000 - ₹2,50,000/month",
      posted: "1 week ago",
      description: "Looking for skilled radiologist to join our diagnostic team. Modern equipment and collaborative environment.",
      responsibilities: [
        "Interpret medical images",
        "Perform ultrasound procedures",
        "Write detailed reports",
        "Consult with physicians",
        "Supervise technicians"
      ],
      requirements: [
        "MD in Radiology",
        "DNB in Radiology",
        "3+ years experience",
        "License to practice",
        "Attention to detail"
      ],
      benefits: [
        "Competitive pay",
        "Latest technology",
        "Continuing education",
        "Flexible hours",
        "Health benefits"
      ]
    },
    {
      id: 6,
      title: "Front Desk Executive",
      department: "support",
      location: "Mumbai",
      type: "Full-time",
      experience: "1-3 years",
      salary: "₹20,000 - ₹30,000/month",
      posted: "2 weeks ago",
      description: "Join our patient relations team as a front desk executive. First point of contact for patients and visitors.",
      responsibilities: [
        "Greet and assist visitors",
        "Schedule appointments",
        "Manage patient records",
        "Answer phone calls",
        "Handle inquiries"
      ],
      requirements: [
        "Bachelor's degree",
        "1+ years experience",
        "Good communication",
        "Computer proficiency",
        "Customer service skills"
      ],
      benefits: [
        "Competitive salary",
        "Training provided",
        "Health insurance",
        "Growth opportunities",
        "Friendly environment"
      ]
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const benefits = [
    { icon: <Heart className="w-8 h-8" />, title: "Health Insurance", description: "Comprehensive medical coverage for you and family" },
    { icon: <TrendingUp className="w-8 h-8" />, title: "Career Growth", description: "Continuous learning and promotion opportunities" },
    { icon: <Award className="w-8 h-8" />, title: "Performance Bonus", description: "Annual performance-based incentives" },
    { icon: <GraduationCap className="w-8 h-8" />, title: "Learning & Development", description: "Paid certifications and training programs" },
    { icon: <Coffee className="w-8 h-8" />, title: "Work-Life Balance", description: "Flexible schedules and wellness programs" },
    { icon: <Gift className="w-8 h-8" />, title: "Festival Bonuses", description: "Additional compensation during festivals" },
    { icon: <Home className="w-8 h-8" />, title: "Housing Allowance", description: "Assistance with accommodation" },
    { icon: <Laptop className="w-8 h-8" />, title: "Modern Facilities", description: "State-of-the-art work environment" }
  ];

  const culturePoints = [
    { icon: <Users className="w-6 h-6" />, title: "Collaborative Environment", description: "Team-first approach to healthcare" },
    { icon: <Smile className="w-6 h-6" />, title: "Patient First", description: "Everything we do revolves around patient care" },
    { icon: <Zap className="w-6 h-6" />, title: "Innovation", description: "Embrace new technologies and methods" },
    { icon: <Brain className="w-6 h-6" />, title: "Continuous Learning", description: "Always improving our skills" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span className="text-sm font-medium">Join Our Team</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Build Your Career in
              <span className="text-teal-300"> Healthcare</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Join India's leading healthcare network and make a difference in millions of lives. 
              We're looking for passionate professionals to join our growing family.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#openings"
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                View Openings
                <ChevronRight className="w-5 h-5" />
              </a>
              <a
                href="#culture"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all"
              >
                <Heart className="w-5 h-5" />
                Our Culture
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="relative -mt-10 max-w-7xl mx-auto px-4 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-teal-600 mb-1">500+</div>
            <div className="text-sm text-gray-600">Healthcare Professionals</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-teal-600 mb-1">50+</div>
            <div className="text-sm text-gray-600">Locations Nationwide</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-teal-600 mb-1">98%</div>
            <div className="text-sm text-gray-600">Employee Satisfaction</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-teal-600 mb-1">25+</div>
            <div className="text-sm text-gray-600">Years of Excellence</div>
          </div>
        </div>
      </div>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Benefits & Perks
            </h2>
            <p className="text-gray-600">
              We offer competitive benefits and a supportive work environment
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition group">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600 group-hover:scale-110 transition">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Culture */}
      <section id="culture" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Our Culture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                A Workplace That Cares
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At ABDHind MediCare, we believe that happy employees provide better patient care. 
                We've created a culture that values innovation, collaboration, and personal growth.
              </p>
              <div className="space-y-4">
                {culturePoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 mt-1">
                      {point.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{point.title}</h3>
                      <p className="text-sm text-gray-600">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center">
                    <ThumbsUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">98%</div>
                    <div className="text-xs text-gray-600">Employee Retention</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center">
                    <Users className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">200+</div>
                    <div className="text-xs text-gray-600">Team Events/Year</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center">
                    <GraduationCap className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">50+</div>
                    <div className="text-xs text-gray-600">Training Programs</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center">
                    <Globe className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">10+</div>
                    <div className="text-xs text-gray-600">International Exposures</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Great Place to Work</p>
                    <p className="text-xs text-gray-500">Certified 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section id="openings" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Join Our Team</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Current Openings
            </h2>
            <p className="text-gray-600">
              Find the perfect role that matches your skills and career goals
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {departments.map((dept) => (
                <button
                  key={dept.value}
                  onClick={() => setSelectedDepartment(dept.value)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedDepartment === dept.value
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dept.name}
                  <span className="ml-2 text-xs opacity-75">({dept.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {job.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{job.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">Posted {job.posted}</span>
                        <button
                          onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-700 transition"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedJob === job.id && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Responsibilities</h4>
                            <ul className="space-y-2">
                              {job.responsibilities.map((resp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Requirements</h4>
                            <ul className="space-y-2">
                              {job.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Benefits</h4>
                            <ul className="space-y-2">
                              {job.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <Link
                            href={`/careers/apply/${job.id}`}
                            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition"
                          >
                            Apply Now
                            <FileText className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No openings found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Application Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How to Apply
            </h2>
            <p className="text-gray-600">
              Simple 4-step process to join our team
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <Search className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold text-teal-600 mb-2">01</div>
              <h3 className="font-semibold text-gray-800 mb-2">Find Role</h3>
              <p className="text-sm text-gray-600">Browse our openings and find the right fit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold text-teal-600 mb-2">02</div>
              <h3 className="font-semibold text-gray-800 mb-2">Submit Application</h3>
              <p className="text-sm text-gray-600">Send your resume and cover letter</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold text-teal-600 mb-2">03</div>
              <h3 className="font-semibold text-gray-800 mb-2">Interview</h3>
              <p className="text-sm text-gray-600">Phone screening and in-person interview</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <Heart className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold text-teal-600 mb-2">04</div>
              <h3 className="font-semibold text-gray-800 mb-2">Join Us</h3>
              <p className="text-sm text-gray-600">Offer letter and onboarding process</p>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-6">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Our Employees Say
            </h2>
            <p className="text-gray-600">
              Hear from our team members about their experience at ABDHind MediCare
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Best workplace I've ever been part of. Great work culture, supportive management, and endless learning opportunities."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Dr. Smita Patel</p>
                  <p className="text-xs text-gray-500">Senior Cardiologist</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The organization truly cares about employee growth. Regular training sessions and clear career progression paths."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Rajesh Kumar</p>
                  <p className="text-xs text-gray-500">Hospital Administrator</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Amazing place to work! The benefits are great, and the team feels like family. Proud to be part of this organization."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Priya Singh</p>
                  <p className="text-xs text-gray-500">Senior Nurse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  );
}