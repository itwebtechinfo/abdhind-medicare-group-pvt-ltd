"use client";
import { Heart, Stethoscope, Clock, Phone, Star, Users, Award, MapPin, Calendar, CheckCircle2, Activity, Brain, Droplet, Shield } from "lucide-react";

export default function CardiologistsPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #be123c 0%, #e11d48 100%)", 
        color: "white", 
        padding: "50px 20px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Heart size={56} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", marginBottom: 12, fontWeight: 700 }}>
            Best Cardiologists
          </h1>
          <p style={{ fontSize: 18, opacity: 0.95 }}>Expert heart care • Advanced treatments • Compassionate approach</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 0", padding: "0 20px 60px" }}>
        
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { value: "15,000+", label: "Heart Surgeries", icon: Heart },
            { value: "20+", label: "Cardiologists", icon: Users },
            { value: "98%", label: "Success Rate", icon: Award },
            { value: "24/7", label: "Emergency Care", icon: Clock },
          ].map((stat, i) => (
            <div key={i} style={{ background: "white", padding: 20, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <stat.icon size={28} color="#e11d48" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Doctors List */}
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Our Cardiology Specialists</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { 
              name: "Dr. Rajiv Mehra", 
              qualification: "MD, DM (Cardiology)", 
              experience: "22+ years",
              specialty: "Interventional Cardiology",
              procedures: "10,000+ angiographies | 5,000+ stents",
              timing: "Mon, Wed, Fri: 10AM - 2PM",
              location: "Delhi - Main",
              rating: 4.9,
              image: "👨‍⚕️"
            },
            { 
              name: "Dr. Priyanka Singh", 
              qualification: "MBBS, MD, DNB (Cardiology)", 
              experience: "18+ years",
              specialty: "Non-Invasive Cardiology",
              procedures: "8,000+ echocardiograms | 3,000+ TMTs",
              timing: "Tue, Thu, Sat: 11AM - 4PM",
              location: "Delhi - Main",
              rating: 4.8,
              image: "👩‍⚕️"
            },
            { 
              name: "Dr. Anil Kumar", 
              qualification: "MBBS, MS, MCh (CTVS)", 
              experience: "25+ years",
              specialty: "Cardio-Thoracic Surgery",
              procedures: "3,000+ bypass surgeries | 1,500+ valve replacements",
              timing: "Mon - Sat: 9AM - 1PM",
              location: "Delhi - Main",
              rating: 4.9,
              image: "👨‍⚕️"
            },
            { 
              name: "Dr. Neha Gupta", 
              qualification: "MD, FACC", 
              experience: "15+ years",
              specialty: "Pediatric Cardiology",
              procedures: "5,000+ pediatric echo | 1,000+ interventions",
              timing: "Wed, Fri, Sun: 10AM - 3PM",
              location: "Noida",
              rating: 4.7,
              image: "👩‍⚕️"
            },
            { 
              name: "Dr. Suresh Reddy", 
              qualification: "MBBS, MD, DM", 
              experience: "20+ years",
              specialty: "Electrophysiology",
              procedures: "2,000+ pacemakers | 1,000+ ablations",
              timing: "Mon, Thu: 2PM - 6PM | Sat: 10AM - 1PM",
              location: "Kushinagar",
              rating: 4.8,
              image: "👨‍⚕️"
            },
          ].map((doc, i) => (
            <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", transition: "transform 0.2s" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {/* Image */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 64 }}>{doc.image}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{doc.rating}</span>
                  </div>
                </div>
                
                {/* Details */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 20, marginBottom: 4 }}>{doc.name}</h3>
                  <p style={{ color: "#e11d48", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{doc.qualification}</p>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{doc.experience} experience</p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
                    <div style={{ background: "#fff1f2", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>
                      <strong>Specialty:</strong> {doc.specialty}
                    </div>
                    <div style={{ background: "#fff1f2", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>
                      <strong>Procedures:</strong> {doc.procedures}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#475569" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color="#e11d48" />
                      <span>{doc.timing}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={14} color="#e11d48" />
                      <span>{doc.location}</span>
                    </div>
                  </div>
                </div>
                
               
              </div>
            </div>
          ))}
        </div>

        {/* Services */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Cardiology Services We Offer</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 32 }}>Comprehensive heart care under one roof</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { icon: Activity, title: "Diagnostic Tests", items: ["ECG", "Echocardiography", "TMT", "Holter Monitoring", "Cardiac CT", "Cardiac MRI"] },
              { icon: Heart, title: "Interventions", items: ["Angiography", "Angioplasty", "Stent Placement", "Rotablation", "IVUS", "FFR"] },
              { icon: Brain, title: "Surgeries", items: ["Bypass Surgery", "Valve Replacement", "Heart Transplant", "Aneurysm Repair", "LVAD"] },
              { icon: Droplet, title: "Special Clinics", items: ["Heart Failure Clinic", "Hypertension Clinic", "Lipid Clinic", "Preventive Cardiology", "Rehab Program"] },
            ].map((cat, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ background: "#fff1f2", width: 50, height: 50, borderRadius: 25, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <cat.icon size={24} color="#e11d48" />
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>{cat.title}</h3>
                {cat.items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span style={{ fontSize: 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div style={{ background: "#fff1f2", borderRadius: 24, padding: "32px 28px", marginTop: 56 }}>
          <h2 style={{ fontSize: 22, textAlign: "center", marginBottom: 24 }}>Why Choose Our Cardiologists?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { icon: Award, title: "Highly Experienced", desc: "20+ years average experience" },
              { icon: Shield, title: "Advanced Technology", desc: "Latest cath lab & equipment" },
              { icon: Clock, title: "24/7 Emergency", desc: "Round-the-clock heart attack care" },
              { icon: Users, title: "Multidisciplinary Team", desc: "Coordinated care approach" },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <item.icon size={28} color="#e11d48" />
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

     

      </div>
    </div>
  );
}