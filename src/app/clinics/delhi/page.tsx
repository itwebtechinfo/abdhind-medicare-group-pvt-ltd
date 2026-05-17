"use client";
import { Building2, MapPin, Phone, Mail, Clock, Star, Calendar, Users, Award, Shield, Stethoscope, Wifi, Coffee, Car, Heart, Activity, CheckCircle2 } from "lucide-react";

export default function DelhiClinicPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
        color: "white", 
        padding: "50px 20px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Building2 size={56} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", marginBottom: 12, fontWeight: 700 }}>
            Delhi - Main Clinic
          </h1>
          <p style={{ fontSize: 18, opacity: 0.95 }}>Sector 44, Noida • Serving since 2017</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 0", padding: "0 20px 60px" }}>
        
        {/* Quick Info Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 40 }}>
          {[
            { icon: MapPin, label: "Address", value: "Sector 44, Near Metro Station, Noida - 201301" },
            { icon: Phone, label: "Contact", value: "+91 95409 29832", link: "tel:+919540929832" },
            { icon: Clock, label: "Timing", value: "Mon-Sat: 9AM - 8PM | Sun: 10AM - 2PM" },
            { icon: Calendar, label: "Emergency", value: "24/7 Available" },
          ].map((info, i) => (
            <div key={i} style={{ background: "white", padding: 20, borderRadius: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ background: "#eff6ff", padding: 10, borderRadius: 12 }}>
                <info.icon size={22} color="#2563eb" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{info.label}</div>
                {info.link ? (
                  <a href={info.link} style={{ fontSize: 15, fontWeight: 600, color: "#1e3a8a", textDecoration: "none" }}>{info.value}</a>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{info.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
          
          {/* Left Column - About */}
          <div>
            <div style={{ background: "white", borderRadius: 20, padding: 28, marginBottom: 24, border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 22, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={22} color="#dc2626" />
                About Our Clinic
              </h2>
              <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                Our Delhi Main Clinic in Sector 44, Noida is a state-of-the-art multi-speciality healthcare facility 
                providing comprehensive medical services to patients across Delhi NCR.
              </p>
              <p style={{ color: "#475569", lineHeight: 1.6 }}>
                Equipped with modern technology and staffed by experienced doctors, we are committed to delivering 
                quality healthcare with compassion and excellence.
              </p>
              
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ background: "#ecfdf5", color: "#059669", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Cashless Insurance</span>
                <span style={{ background: "#ecfdf5", color: "#059669", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>24/7 Pharmacy</span>
              </div>
            </div>

            {/* Facilities */}
            <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 22, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={22} color="#f59e0b" />
                Clinic Facilities
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {[
                  { icon: Stethoscope, name: "Modern Equipment" },
                  { icon: Wifi, name: "Free WiFi" },
                  { icon: Coffee, name: "Patient Lounge" },
                  { icon: Car, name: "Parking Available" },
                  { icon: Shield, name: "24/7 Security" },
                ].map(f => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <f.icon size={18} color="#3b82f6" />
                    <span style={{ fontSize: 14 }}>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Doctors & Services */}
          <div>
            {/* Doctors */}
            <div style={{ background: "white", borderRadius: 20, padding: 28, marginBottom: 24, border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 22, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={22} color="#2563eb" />
                Our Doctors
              </h2>
              {[
                { name: "Dr. Ekhlaq Ahmed", specialty: "Dental Surgeon", exp: "9+ Years", timing: "Mon-Sat: 10AM-6PM" },
                { name: "Dr. Priya Sharma", specialty: "Physician", exp: "12+ Years", timing: "Mon-Sat: 9AM-5PM" },
                { name: "Dr. Rajesh Kumar", specialty: "Orthopedic", exp: "15+ Years", timing: "Tue-Thu-Sat: 11AM-7PM" },
              ].map(doc => (
                <div key={doc.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{doc.specialty} • {doc.exp}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#059669" }}>{doc.timing}</div>
                </div>
              ))}
              <button style={{ width: "100%", marginTop: 16, background: "#eff6ff", border: "none", padding: "10px", borderRadius: 40, color: "#2563eb", fontWeight: 600, cursor: "pointer" }}>
                View All Doctors →
              </button>
            </div>

            {/* Services */}
            <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 22, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={22} color="#10b981" />
                Specialties
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {[
                  "Dental Care", "General Medicine", "Orthopedics", "Cardiology", 
                  "Pediatrics", "Gynecology", "Dermatology", "ENT", 
                  "Physiotherapy", "Diagnostics"
                ].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={14} color="#10b981" />
                    <span style={{ fontSize: 14 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        

      

      </div>
    </div>
  );
}