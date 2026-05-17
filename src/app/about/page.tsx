"use client";
import { Heart, Stethoscope, Users, Award, Clock, Globe, Target, Eye, HandHeart, Shield, Sparkles, Star, Quote, Zap, Building2, Phone, Mail, MapPin, Calendar, CheckCircle2, Activity, Brain, Microscope, Pill, Ambulance, Flower2, TrendingUp, BadgeCheck, Crown, Leaf, Sun, Moon } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#faf9f6", minHeight: "100vh" }}>
      
      {/* Hero Section with Overlay */}
      <div style={{ 
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", 
        color: "white", 
        padding: "80px 20px 100px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(16,185,129,0.1)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, background: "rgba(59,130,246,0.08)", borderRadius: "50%" }} />
        
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ background: "rgba(16,185,129,0.2)", padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "#10b981" }}>
              Since 2017
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 64px)", marginBottom: 20, fontWeight: 800 }}>
            Redefining Healthcare
            <br />
            <span style={{ color: "#10b981" }}>With Compassion & Excellence</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 4vw, 18px)", opacity: 0.9, maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
            Abd Hind MediCare Group is a multi-dimensional healthcare organization committed to delivering 
            quality clinical care, precision diagnostics, and innovative healthcare solutions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-50px auto 0", padding: "0 20px 60px" }}>
        
        {/* Vision & Mission Cards - Floating */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30, marginBottom: 70 }}>
          {/* Vision Card */}
          <div style={{ 
            background: "white", 
            borderRadius: 30, 
            padding: "32px 28px",
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: "rgba(59,130,246,0.05)", borderRadius: "0 0 0 100%" }} />
            <div style={{ background: "#eff6ff", width: 60, height: 60, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Eye size={30} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: 26, marginBottom: 16, fontWeight: 700 }}>Our Vision</h2>
            <p style={{ color: "#475569", lineHeight: 1.7, fontSize: 15 }}>
              To become India's most trusted healthcare ecosystem, making quality medical care accessible, 
              affordable, and compassionate for every individual, while setting new standards in medical innovation.
            </p>
          </div>

          {/* Mission Card */}
          <div style={{ 
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", 
            borderRadius: 30, 
            padding: "32px 28px",
            color: "white",
            boxShadow: "0 20px 40px -12px rgba(5,150,105,0.3)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
            <div style={{ background: "rgba(255,255,255,0.2)", width: 60, height: 60, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Target size={30} color="white" />
            </div>
            <h2 style={{ fontSize: 26, marginBottom: 16, fontWeight: 700 }}>Our Mission</h2>
            <p style={{ lineHeight: 1.7, fontSize: 15, opacity: 0.95 }}>
              To deliver exceptional healthcare through a patient-first approach, leveraging advanced technology, 
              expert medical professionals, and continuous innovation to improve lives and build healthier communities.
            </p>
          </div>
        </div>

        {/* Founder Story Section */}
        <div style={{ marginBottom: 70 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: "#ecfdf5", padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 16 }}>
              Founder's Story
            </div>
            <h2 style={{ fontSize: "clamp(28px, 6vw, 38px)", fontWeight: 700, marginBottom: 16 }}>
              Driven by Purpose,<br />Guided by Compassion
            </h2>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 40, alignItems: "center" }}>
            <div>
              <div style={{ 
                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", 
                borderRadius: 30, 
                padding: "40px 30px",
                position: "relative"
              }}>
                <Quote size={40} color="#10b981" style={{ opacity: 0.3, position: "absolute", top: 20, right: 20 }} />
                <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
                <h3 style={{ fontSize: 24, marginBottom: 8, fontWeight: 700 }}>Dr. Ekhlaq Ahmed</h3>
                <p style={{ color: "#059669", fontWeight: 600, marginBottom: 20 }}>Founder & Director | Lead Dental Surgeon</p>
                <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>
                  With over 9 years of clinical experience and a vision to transform healthcare delivery, 
                  Dr. Ekhlaq Ahmed founded Abd Hind MediCare Group to bridge the gap between quality medical care and patient accessibility.
                </p>
                <p style={{ color: "#475569", lineHeight: 1.7 }}>
                  His philosophy of "Your problem, our care — restoring natural health with satisfaction" 
                  drives every aspect of the organization, ensuring patient-centric care remains at the heart of all operations.
                </p>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <span style={{ background: "#d1fae5", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>10+ Years Experience</span>
                  <span style={{ background: "#d1fae5", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Regenerative Dentistry Expert</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ 
                background: "linear-gradient(145deg, #1e293b, #0f172a)", 
                borderRadius: 30, 
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              }}>
                <img 
                  src="/dr-img-abdHind.jpeg" 
                  alt="Dr. Ekhlaq Ahmed" 
                  style={{ width: "100%", height: "auto", display: "block" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x500/1e293b/10b981?text=Dr.+Ekhlaq+Ahmed" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div style={{ marginBottom: 70 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: "#ecfdf5", padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 16 }}>
              Our Core Values
            </div>
            <h2 style={{ fontSize: "clamp(28px, 6vw, 38px)", fontWeight: 700, marginBottom: 16 }}>
              What Drives Us Every Day
            </h2>
            <p style={{ color: "#64748b", maxWidth: 600, margin: "0 auto" }}>These principles guide our actions and define our culture</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
            {[
              { icon: HandHeart, title: "Compassionate Care", desc: "Treating every patient with empathy, respect, and dignity", color: "#ef4444", bg: "#fef2f2" },
              { icon: Shield, title: "Clinical Excellence", desc: "Maintaining highest medical standards and safety protocols", color: "#3b82f6", bg: "#eff6ff" },
              { icon: Target, title: "Patient First", desc: "Every decision prioritizes patient well-being and outcomes", color: "#059669", bg: "#ecfdf5" },
              { icon: Award, title: "Continuous Innovation", desc: "Embracing latest technology and treatment methodologies", color: "#8b5cf6", bg: "#f5f3ff" },
              { icon: Users, title: "Teamwork", desc: "Collaborative approach across all medical specialties", color: "#f59e0b", bg: "#fffbeb" },
              { icon: Globe, title: "Accessibility", desc: "Making quality healthcare available to all communities", color: "#06b6d4", bg: "#cffafe" },
            ].map((value, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", transition: "all 0.3s", cursor: "pointer" }}>
                <div style={{ background: value.bg, width: 55, height: 55, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <value.icon size={28} color={value.color} />
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>{value.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Numbers Section */}
        <div style={{ 
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
          borderRadius: 30, 
          padding: "50px 40px", 
          marginBottom: 70,
          textAlign: "center"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
            {[
              { value: "10,000+", label: "Patients Treated", icon: Users },
              { value: "50+", label: "Expert Doctors", icon: Stethoscope },
              { value: "98%", label: "Patient Satisfaction", icon: Star },
              { value: "24/7", label: "Emergency Support", icon: Clock },
              { value: "3", label: "Clinic Locations", icon: Building2 },
              { value: "5000+", label: "Online Consultations", icon: Phone },
            ].map((stat, i) => (
              <div key={i}>
                <stat.icon size={32} color="#10b981" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: "#94a3b8" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Ecosystem */}
        <div style={{ marginBottom: 70 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: "#ecfdf5", padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 16 }}>
              Complete Healthcare Ecosystem
            </div>
            <h2 style={{ fontSize: "clamp(28px, 6vw, 38px)", fontWeight: 700, marginBottom: 16 }}>
              One Destination for All Your Healthcare Needs
            </h2>
            <p style={{ color: "#64748b", maxWidth: 600, margin: "0 auto" }}>Integrated services under one roof for seamless patient experience</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { icon: Stethoscope, name: "Clinical Care", desc: "Multi-speciality medical services" },
              { icon: Microscope, name: "Diagnostics", desc: "Advanced lab & imaging" },
              { icon: Pill, name: "Pharmacy", desc: "24/7 medicine supply" },
              { icon: Heart, name: "Wellness", desc: "Preventive health programs" },
              { icon: Phone, name: "Telemedicine", desc: "Online doctor consultations" },
              { icon: Ambulance, name: "Emergency", desc: "24/7 critical care" },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ background: "#ecfdf5", width: 55, height: 55, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <item.icon size={26} color="#059669" />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

   

        {/* Locations */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Our Presence</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 40 }}>Serving communities across India</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { city: "Delhi NCR", address: "Sector 44, Noida", phone: "+91 95409 29832", timing: "24/7 Emergency" },
              { city: "Kushinagar", address: "Kasia, Kushinagar, UP", phone: "+91 98765 43211", timing: "8AM - 10PM" },
            ].map((loc, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <Building2 size={24} color="#10b981" />
                  <h3 style={{ fontSize: 20, margin: 0 }}>{loc.city}</h3>
                </div>
                <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>📍 {loc.address}</div>
                <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>📞 {loc.phone}</div>
                <div style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>🕒 {loc.timing}</div>
              </div>
            ))}
          </div>
        </div>

   

      </div>
    </div>
  );
}