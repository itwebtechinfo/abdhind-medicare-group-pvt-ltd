"use client";
import { Phone, Video, Clock, Shield, Star, CheckCircle2, Users, Calendar, MessageCircle, FileText, Pill, Heart, Activity, Brain, Baby, Stethoscope, Award, Zap, Home, Wifi, Laptop } from "lucide-react";

export default function TelemedicinePage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)", 
        color: "white", 
        padding: "50px 20px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Video size={56} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", marginBottom: 12, fontWeight: 700 }}>
            Telemedicine Consultation
          </h1>
          <p style={{ fontSize: 18, opacity: 0.95 }}>Consult doctors from home • Safe • Convenient • Affordable</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 0", padding: "0 20px 60px" }}>
        
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { value: "50,000+", label: "Online Consultations", icon: Users },
            { value: "30+", label: "Specialists", icon: Stethoscope },
            { value: "24/7", label: "Doctor Available", icon: Clock },
            { value: "4.9★", label: "Patient Rating", icon: Star },
          ].map((stat, i) => (
            <div key={i} style={{ background: "white", padding: 20, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <stat.icon size={28} color="#0891b2" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>How Telemedicine Works</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 32 }}>Get medical advice in 4 simple steps</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { step: "1", title: "Book Appointment", desc: "Choose doctor & preferred time slot", icon: Calendar },
              { step: "2", title: "Receive Link", desc: "Get video/audio call link on WhatsApp/SMS", icon: MessageCircle },
              { step: "3", title: "Consult Online", desc: "Talk to doctor from anywhere", icon: Video },
              { step: "4", title: "Get Prescription", desc: "Receive e-prescription & health advice", icon: FileText },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ background: "#0891b2", color: "white", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: "bold", fontSize: 18 }}>{item.step}</div>
                <item.icon size={28} color="#0891b2" style={{ marginBottom: 10 }} />
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Available */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Available Specialists</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 32 }}>Consult top doctors online</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { name: "General Physician", icon: Stethoscope, doctors: "5+ Doctors", fee: "₹399", timing: "9AM - 9PM" },
              { name: "Cardiologist", icon: Heart, doctors: "3+ Doctors", fee: "₹599", timing: "10AM - 6PM" },
              { name: "Dermatologist", icon: Activity, doctors: "4+ Doctors", fee: "₹499", timing: "11AM - 7PM" },
              { name: "Pediatrician", icon: Baby, doctors: "3+ Doctors", fee: "₹449", timing: "9AM - 8PM" },
              { name: "Gynecologist", icon: Heart, doctors: "4+ Doctors", fee: "₹499", timing: "10AM - 7PM" },
              { name: "Psychologist", icon: Brain, doctors: "3+ Doctors", fee: "₹549", timing: "11AM - 8PM" },
            ].map((spec, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "#cffafe", padding: 10, borderRadius: 12 }}>
                    <spec.icon size={24} color="#0891b2" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, marginBottom: 2 }}>{spec.name}</h3>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{spec.doctors} • {spec.timing}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0891b2" }}>{spec.fee}</div>
                  {/* <button style={{ background: "#0891b2", color: "white", border: "none", padding: "4px 16px", borderRadius: 20, fontSize: 12, marginTop: 4, cursor: "pointer" }}>Consult</button> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>Benefits of Telemedicine</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { icon: Home, title: "Consult from Home", desc: "No travel or waiting time" },
              { icon: Clock, title: "Save Time", desc: "Get quick medical advice" },
              { icon: Shield, title: "Safe & Private", desc: "Secure video consultations" },
              { icon: Pill, title: "E-Prescription", desc: "Medicine delivered to home" },
              { icon: Users, title: "Second Opinion", desc: "Consult multiple specialists" },
              { icon: FileText, title: "Digital Records", desc: "All prescriptions stored online" },
            ].map((benefit, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ background: "#cffafe", width: 50, height: 50, borderRadius: 25, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <benefit.icon size={24} color="#0891b2" />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>{benefit.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b" }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

     

        {/* Testimonials */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>What Patients Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { name: "Rahul Sharma", text: "Very convenient! Consulted a cardiologist from home. Got prescription within 30 mins.", rating: 5 },
              { name: "Neha Gupta", text: "Great platform for online consultation. Doctors are very professional and helpful.", rating: 5 },
              { name: "Amit Kumar", text: "Saved so much time and travel. Will definitely use again for follow-ups.", rating: 4.9 },
            ].map((t, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} color="#fbbf24" fill={j < Math.floor(t.rating) ? "#fbbf24" : "none"} />)}
                </div>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, marginBottom: 12 }}>"{t.text}"</p>
                <p style={{ fontWeight: 600 }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>

      

      </div>
    </div>
  );
}