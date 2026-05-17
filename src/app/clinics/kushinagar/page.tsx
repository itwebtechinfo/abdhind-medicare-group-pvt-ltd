"use client";
import { Building2, MapPin, Phone, Mail, Clock, Star, Calendar, Users, Award, Shield, Stethoscope, Wifi, Coffee, Car, Heart, Activity, CheckCircle2, LocateFixed } from "lucide-react";

export default function KushinagarClinicPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #065f46 0%, #059669 100%)", 
        color: "white", 
        padding: "50px 20px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Building2 size={56} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", marginBottom: 12, fontWeight: 700 }}>
            Kushinagar Clinic
          </h1>
          <p style={{ fontSize: 18, opacity: 0.95 }}>Kasia, Kushinagar • Serving the community with care</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 0", padding: "0 20px 60px" }}>
        
        {/* Quick Info Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 40 }}>
          {[
            { icon: MapPin, label: "Address", value: "Kasia, Kushinagar, Uttar Pradesh - 274402" },
            { icon: Phone, label: "Contact", value: "+91 98765 43211", link: "tel:+919876543211" },
            { icon: Clock, label: "Timing", value: "Mon-Sat: 9AM - 7PM | Sun: 10AM - 2PM" },
            { icon: Calendar, label: "Emergency", value: "24/7 Available" },
          ].map((info, i) => (
            <div key={i} style={{ background: "white", padding: 20, borderRadius: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ background: "#ecfdf5", padding: 10, borderRadius: 12 }}>
                <info.icon size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{info.label}</div>
                {info.link ? (
                  <a href={info.link} style={{ fontSize: 15, fontWeight: 600, color: "#065f46", textDecoration: "none" }}>{info.value}</a>
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
                Our Kushinagar Clinic in Kasia is dedicated to providing quality healthcare services to the local community. 
                We offer comprehensive medical care with a focus on patient comfort and satisfaction.
              </p>
              <p style={{ color: "#475569", lineHeight: 1.6 }}>
                Equipped with modern facilities and staffed by experienced medical professionals, we strive to make 
                healthcare accessible and affordable for everyone in Kushinagar and surrounding areas.
              </p>
              
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ background: "#ecfdf5", color: "#059669", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Quality Care</span>
                <span style={{ background: "#ecfdf5", color: "#059669", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Affordable Treatment</span>
                <span style={{ background: "#ecfdf5", color: "#059669", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Experienced Staff</span>
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
                  { icon: Shield, name: "Clean & Safe" },
                ].map(f => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <f.icon size={18} color="#059669" />
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
                { name: "Dr. Neha Verma", specialty: "Physician", exp: "8+ Years", timing: "Mon-Sat: 9AM-5PM" },
                { name: "Dr. Suresh Patel", specialty: "Ayurveda", exp: "12+ Years", timing: "Mon-Thu-Sat: 11AM-7PM" },
              ].map(doc => (
                <div key={doc.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{doc.specialty} • {doc.exp}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#059669" }}>{doc.timing}</div>
                </div>
              ))}
              <button style={{ width: "100%", marginTop: 16, background: "#ecfdf5", border: "none", padding: "10px", borderRadius: 40, color: "#059669", fontWeight: 600, cursor: "pointer" }}>
                View All Doctors →
              </button>
            </div>

            {/* Services */}
            <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 22, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={22} color="#10b981" />
                Our Services
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {[
                  "Dental Care", "General Medicine", "Ayurveda", "Physiotherapy",
                  "Pediatrics", "Women's Health", "Diagnostics", "Pharmacy",
                  "Vaccination", "Health Checkups"
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

        {/* Local Info */}
        <div style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", borderRadius: 20, marginTop: 32, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <LocateFixed size={24} color="#059669" />
            <h3 style={{ fontSize: 18 }}>About Kushinagar</h3>
          </div>
          <p style={{ color: "#065f46", lineHeight: 1.6 }}>
            Kushinagar is a historic town known for its spiritual significance. Our clinic at Kasia serves the local 
            community with quality healthcare services, making medical care accessible to residents of Kushinagar 
            and nearby villages.
          </p>
        </div>


      </div>
    </div>
  );
}