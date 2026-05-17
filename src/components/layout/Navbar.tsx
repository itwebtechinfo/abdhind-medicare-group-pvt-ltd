"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Phone,
  MessageCircle,
  ChevronDown,
  Heart,
  Stethoscope,
  Microscope,
  Pill,
  Ambulance,
  Calendar,
  Building2,
  Menu,
  X,
  Clock,
  MapPin,
  Mail,
  Award,
  Shield,
  Users,
  Activity,
  Bone,
  Brain,
  Eye,
  Baby,
  Droplets,
  Sparkles,
  Star,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  dropdown?: {
    title: string;
    items: {
      name: string;
      href: string;
      icon?: React.ReactNode;
      description?: string;
    }[];
  }[];
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("/");
  const menuRef = useRef<HTMLDivElement>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    time: "Morning",
  });

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    {
      name: "Services",
      href: "/services",
      dropdown: [
        {
          title: "Medical Services",
          items: [
            {
              name: "Emergency 24/7",
              href: "/services/emergency",
              icon: <Ambulance className="w-5 h-5" />,
              description: "Round-the-clock critical care",
            },
            {
              name: "Pharmacy",
              href: "/services/pharmacy",
              icon: <Pill className="w-5 h-5" />,
              description: "Authentic medicines delivered",
            },
            {
              name: "Diagnostics",
              href: "/services/diagnostics",
              icon: <Microscope className="w-5 h-5" />,
              description: "Advanced lab tests",
            },
            {
              name: "Telemedicine",
              href: "/services/telemedicine",
              icon: <Phone className="w-5 h-5" />,
              description: "Consult from home",
            },
          ],
        },
        {
          title: "Patient Services",
          items: [
            {
              name: "Insurance Desk",
              href: "/services/insurance",
              icon: <Shield className="w-5 h-5" />,
              description: "Cashless treatment",
            },
         
            {
              name: "Wellness Programs",
              href: "/services/wellness",
              icon: <Activity className="w-5 h-5" />,
              description: "Preventive health",
            },
          ],
        },
      ],
    },
    {
      name: "Clinics",
      href: "/clinics",
      dropdown: [
        {
          title: "Our Locations",
          items: [
            {
              name: "Delhi - Main",
              href: "/clinics/delhi",
              icon: <Building2 className="w-5 h-5" />,
              description: "Sector 44, Noida",
            },
            {
              name: "Kushinagar",
              href: "/clinics/kushinagar",
              icon: <Building2 className="w-5 h-5" />,
              description: "Kasia Kushinagar",
            },
          ],
        },
      ],
    },
    {
      name: "Doctor",
      href: "/doctors",
      dropdown: [
        {
          title: "Specialties",
          items: [
            {
              name: "Cardiologists",
              href: "/doctors/cardiology",
              icon: <Heart className="w-5 h-5" />,
            },
            {
              name: "Orthopedics",
              href: "/doctors/orthopedics",
              icon: <Bone className="w-5 h-5" />,
            },
            {
              name: "Neurologists",
              href: "/doctors/neurology",
              icon: <Brain className="w-5 h-5" />,
            },
            {
              name: "Ophthalmologists",
              href: "/doctors/ophthalmology",
              icon: <Eye className="w-5 h-5" />,
            },
            {
              name: "Pediatricians",
              href: "/doctors/pediatrics",
              icon: <Baby className="w-5 h-5" />,
            },
          ],
        },
      ],
    },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
  ];

  const handleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
        setEnquiryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveTab(window.location.pathname);
  }, []);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enquiry submitted:", enquiryForm);
    setEnquiryForm({ name: "", phone: "", time: "Morning" });
    setEnquiryOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed top-0 left-0 w-full z-50">
      {/* Top Bar */}
      <div className="w-full bg-gradient-to-r from-teal-900 to-teal-800 text-white text-xs border-b border-teal-700/50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="hidden sm:flex items-center gap-3 text-[12px]">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-teal-300" />
                5.0★ Rated
              </span>
              <span className="opacity-40">•</span>

              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-300" />
                5000+ Treatments
              </span>
              <span className="opacity-40">•</span>

              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-300" />
                100% Transparent
              </span>
            </div>

            {/* Mobile */}
            <div className="sm:hidden text-[11px] font-medium text-teal-200 whitespace-nowrap overflow-hidden text-ellipsis">
              ⭐ 5.0 Rated • 5000+ Treatments • 100% Transparent
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <a
                href="tel:+911234567890"
                className="flex items-center gap-1.5 hover:text-teal-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+91 1234567890</span>
              </a>
              <a
                href="https://wa.me/911234567890"
                className="flex items-center gap-1.5 hover:text-teal-300 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <div className="hidden md:flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>24/7 Emergency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="w-full bg-white/95 backdrop-blur-md border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setActiveTab("/")}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-11 h-11">
                <Image
                  src="/logo.png"
                  alt="ABDHind MediCare Logo"
                  fill
                  sizes="44px"
                  className="object-contain transition-transform group-hover:scale-105"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-xl font-bold tracking-tight">
                  <span className="text-sky-400">Abd Hind </span>
                  <span className="text-green-400">MediCare</span>
                </div>
                <p className="text-[10px] tracking-[0.2em] text-gray-400 font-medium">
                  GROUP PVT. LTD.
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown ? (
                    <button
                      onClick={() => handleDropdown(item.name)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === item.href || openDropdown === item.name
                          ? "text-teal-600 bg-teal-50"
                          : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === item.name ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setActiveTab(item.href)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === item.href
                          ? "text-teal-600 bg-teal-50"
                          : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && openDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-6 p-5 bg-gradient-to-br from-white to-gray-50">
                        {item.dropdown.map((section) => (
                          <div key={section.title}>
                            <h4 className="font-semibold text-teal-700 mb-3 text-sm flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5" />
                              {section.title}
                            </h4>
                            <div className="space-y-2">
                              {section.items.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => {
                                    setActiveTab(subItem.href);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-teal-50 transition-all duration-200 group/item"
                                >
                                  <div className="text-teal-500 mt-0.5">
                                    {subItem.icon}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm group-hover/item:text-teal-700">
                                      {subItem.name}
                                    </p>
                                    {subItem.description && (
                                      <p className="text-xs text-gray-500">
                                        {subItem.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Enquiry Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setEnquiryOpen(!enquiryOpen)}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    enquiryOpen
                      ? "bg-teal-600 text-white shadow-lg"
                      : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                  }`}
                >
                  Quick Enquiry
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${enquiryOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Enquiry Form */}
                {enquiryOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-3">
                      <h3 className="text-white font-semibold">
                        Quick Enquiry
                      </h3>
                      <p className="text-teal-100 text-xs">
                        Get a callback in 30 minutes
                      </p>
                    </div>
                    <form
                      onSubmit={handleEnquirySubmit}
                      className="p-5 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.name}
                          onChange={(e) =>
                            setEnquiryForm({
                              ...enquiryForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your name"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={enquiryForm.phone}
                          onChange={(e) =>
                            setEnquiryForm({
                              ...enquiryForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+91 Enter mobile number"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time
                        </label>
                        <select
                          value={enquiryForm.time}
                          onChange={(e) =>
                            setEnquiryForm({
                              ...enquiryForm,
                              time: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                        >
                          <option>Morning (9 AM - 12 PM)</option>
                          <option>Afternoon (12 PM - 4 PM)</option>
                          <option>Evening (4 PM - 8 PM)</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2.5 rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-md"
                      >
                        Submit Enquiry →
                      </button>
                      <label className="flex items-center gap-2 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded text-teal-600"
                        />
                        Get Updates on WhatsApp
                      </label>
                    </form>
                  </div>
                )}
              </div>

              {/* Book Appointment Button */}
              <Link
                href="/book-appointment"
                onClick={() => setActiveTab("/book-appointment")}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-[108px] left-0 w-full h-[calc(100vh-108px)] bg-white z-50 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden overflow-y-auto shadow-xl`}
      >
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.name} className="border-b border-gray-100">
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => handleDropdown(`mobile-${item.name}`)}
                    className="flex items-center justify-between w-full py-3 text-gray-800 font-medium"
                  >
                    {item.name}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openDropdown === `mobile-${item.name}` ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === `mobile-${item.name}` && (
                    <div className="pl-4 pb-3 space-y-3">
                      {item.dropdown.map((section) => (
                        <div key={section.title}>
                          <p className="text-sm font-semibold text-teal-600 mb-2">
                            {section.title}
                          </p>
                          <div className="space-y-2">
                            {section.items.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => {
                                  setActiveTab(subItem.href);
                                  setMobileMenuOpen(false);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center gap-3 py-2 text-gray-600 text-sm"
                              >
                                {subItem.icon}
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`block py-3 font-medium ${
                    activeTab === item.href ? "text-teal-600" : "text-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
          <Link
            href="/book-appointment"
            onClick={() => {
              setActiveTab("/book-appointment");
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-5 py-3 rounded-xl shadow-md mt-4 w-full font-medium"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}




    </div>
    
  );
}
