"use client";
import { Heart, Activity, Apple, Sparkles, Shield, Clock, Users, Calendar, Phone, Star, Flower2, Wind, Droplets, Sun, Moon, Brain, HeartPulse, Baby, UsersRound, Award, CheckCircle2, ArrowRight } from "lucide-react";

export default function WellnessPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5fef7", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)", 
        color: "white", 
        padding: "60px 20px 80px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Sparkles size={56} style={{ marginBottom: 16, opacity: 0.9 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", marginBottom: 16, fontWeight: 700 }}>
            Wellness & <span style={{ color: "#a7f3d0" }}>Preventive</span> Care
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.95, maxWidth: 600, margin: "0 auto" }}>
            Invest in your health today for a better tomorrow. Comprehensive wellness programs tailored for you.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-40px auto 0", padding: "0 20px 60px" }}>
        
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { value: "50,000+", label: "Happy Patients", icon: Users },
            { value: "100+", label: "Wellness Programs", icon: Calendar },
            { value: "30+", label: "Expert Doctors", icon: Brain },
            { value: "98%", label: "Satisfaction Rate", icon: Star },
          ].map((stat, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: 20, textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <stat.icon size={28} color="#059669" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 28, fontWeight: 700, color: "#064e3b" }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{ 
          background: "#ecfdf5", 
          borderRadius: 24, 
          padding: "40px 32px", 
          marginBottom: 48,
          textAlign: "center",
          borderLeft: "4px solid #059669"
        }}>
          <p style={{ fontSize: "20px", fontStyle: "italic", color: "#064e3b", maxWidth: 700, margin: "0 auto", lineHeight: 1.5 }}>
            "Prevention is better than cure. Regular health checkups and a healthy lifestyle can prevent 80% of chronic diseases."
          </p>
          <p style={{ marginTop: 16, fontWeight: 600, color: "#059669" }}>— WHO Global Health Guidelines</p>
        </div>

        {/* Wellness Programs */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Our Wellness Programs</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 40 }}>Choose a program that fits your health needs</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {[
              {
                icon: Heart,
                title: "Cardiac Wellness",
                desc: "Heart health assessment, cholesterol management, and lifestyle modification programs.",
                features: ["ECG & Stress Test", "Lipid Profile", "Diet Consultation", "Yoga for Heart"],
                color: "#dc2626",
                bg: "#fef2f2"
              },
              {
                icon: Apple,
                title: "Diabetes Care",
                desc: "Comprehensive diabetes management with diet planning and regular monitoring.",
                features: ["HbA1c Test", "Foot Care", "Nutrition Plan", "Insulin Management"],
                color: "#ea580c",
                bg: "#fff7ed"
              },
              {
                icon: Brain,
                title: "Mental Wellness",
                desc: "Stress management, anxiety relief, and emotional wellbeing programs.",
                features: ["Counseling", "Meditation", "Sleep Therapy", "Stress Assessment"],
                color: "#7c3aed",
                bg: "#f5f3ff"
              },
              {
                icon: Activity,
                title: "Corporate Wellness",
                desc: "Employee health programs, on-site checkups, and wellness workshops.",
                features: ["Health Camps", "Ergonomics", "Stress Mgmt", "Fitness Sessions"],
                color: "#2563eb",
                bg: "#eff6ff"
              },
              {
                icon: Baby,
                title: "Women's Wellness",
                desc: "Complete health packages for women across all life stages.",
                features: ["Mammography", "Bone Density", "Hormonal Check", "Pregnancy Care"],
                color: "#db2777",
                bg: "#fdf2f8"
              },
              {
                icon: UsersRound,
                title: "Senior Care",
                desc: "Specialized health programs for elderly population.",
                features: ["Bone Health", "Memory Screening", "Fall Prevention", "Regular Monitoring"],
                color: "#059669",
                bg: "#ecfdf5"
              },
            ].map((program, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", transition: "transform 0.2s" }}>
                <div style={{ 
                  background: program.bg, 
                  width: 60, 
                  height: 60, 
                  borderRadius: 30, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginBottom: 20
                }}>
                  <program.icon size={30} color={program.color} />
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{program.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>{program.desc}</p>
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                  {program.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span style={{ fontSize: 13, color: "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Wellness Tips */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 40 }}>Daily Wellness Tips</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { icon: Droplets, title: "Stay Hydrated", tip: "Drink 8-10 glasses of water daily", color: "#3b82f6" },
              { icon: Apple, title: "Eat Smart", tip: "Include fruits & vegetables in every meal", color: "#22c55e" },
              { icon: Activity, title: "Move More", tip: "30 minutes of exercise, 5 days a week", color: "#ef4444" },
              { icon: Moon, title: "Sleep Well", tip: "7-8 hours of quality sleep", color: "#8b5cf6" },
              { icon: Wind, title: "Breathe Deep", tip: "Practice deep breathing daily", color: "#14b8a6" },
              { icon: Sun, title: "Get Sunlight", tip: "15 mins morning sunlight for Vitamin D", color: "#f59e0b" },
            ].map((tip, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ background: `${tip.color}10`, width: 50, height: 50, borderRadius: 25, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <tip.icon size={24} color={tip.color} />
                </div>
                <h4 style={{ marginBottom: 6 }}>{tip.title}</h4>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Section */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Meet Our Wellness Experts</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 40 }}>Experienced doctors guiding your wellness journey</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            {[
              { name: "Dr. Priya Sharma", role: "Chief Wellness Officer", exp: "15+ years", specialty: "Preventive Medicine", image: "👩‍⚕️" },
              { name: "Dr. Rajesh Kumar", role: "Senior Nutritionist", exp: "12+ years", specialty: "Clinical Nutrition", image: "👨‍⚕️" },
              { name: "Dr. Anjali Mehta", role: "Mental Health Expert", exp: "10+ years", specialty: "Stress Management", image: "👩‍⚕️" },
              { name: "Dr. Vikram Singh", role: "Fitness Specialist", exp: "8+ years", specialty: "Lifestyle Medicine", image: "👨‍⚕️" },
            ].map((doc, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>{doc.image}</div>
                <h3 style={{ fontSize: 18, marginBottom: 4 }}>{doc.name}</h3>
                <p style={{ color: "#059669", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{doc.role}</p>
                <p style={{ fontSize: 13, color: "#64748b" }}>{doc.exp} • {doc.specialty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 40 }}>What Our Patients Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { name: "Ramesh Gupta", text: "The wellness program helped me reduce my cholesterol naturally. Highly recommend!", rating: 5 },
              { name: "Sunita Reddy", text: "Excellent preventive care package. Very thorough and professional team.", rating: 5 },
              { name: "Amit Patel", text: "Mental wellness counseling changed my life. Thank you for the support.", rating: 5 },
            ].map((t, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>"{t.text}"</p>
                <p style={{ fontWeight: 600 }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ 
          background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)", 
          borderRadius: 28, 
          padding: "48px 32px", 
          textAlign: "center", 
          color: "white" 
        }}>
          <HeartPulse size={48} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 28, marginBottom: 12 }}>Start Your Wellness Journey Today</h3>
          <p style={{ marginBottom: 28, opacity: 0.9, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Book a wellness consultation or health checkup package
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+919540929832" style={{ background: "white", color: "#064e3b", padding: "14px 32px", borderRadius: 50, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Phone size={18} />
              Call for Appointment
            </a>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "14px 32px", borderRadius: 50, fontWeight: 600 }}>
              📧 wellness@abhindmedicare.com
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}