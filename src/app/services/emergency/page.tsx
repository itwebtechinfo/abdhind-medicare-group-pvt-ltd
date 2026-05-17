"use client";
import { Phone, Ambulance, Clock, Shield, Heart, MapPin } from "lucide-react";

export default function EmergencyPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Simple Red Header */}
      <div style={{ background: "#dc2626", color: "white", textAlign: "center", padding: "12px", fontWeight: "bold" }}>
        🚨 24/7 EMERGENCY SERVICE • CALL NOW: +91 95409 29832
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <Ambulance size={64} color="#dc2626" style={{ marginBottom: 20 }} />
        <h1 style={{ fontSize: "clamp(32px, 8vw, 48px)", marginBottom: 16 }}>
          Medical Emergency?
        </h1>
        <p style={{ fontSize: "18px", color: "#334155", marginBottom: 32 }}>
          We're here 24/7. Free ambulance service available across Delhi NCR.
        </p>
        
        {/* Big Call Button */}
        <a 
          href="tel:+919540929832"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "#dc2626",
            color: "white",
            padding: "16px 32px",
            borderRadius: 50,
            fontSize: "24px",
            fontWeight: "bold",
            textDecoration: "none",
            marginBottom: 40
          }}
        >
          <Phone size={28} />
          +91 95409 29832
        </a>

        {/* Quick Info Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 40 }}>
          <div style={{ background: "white", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <Clock color="#dc2626" style={{ marginBottom: 8 }} />
            <h3>24/7 Available</h3>
            <p style={{ fontSize: 14, color: "#64748b" }}>Always open, always ready</p>
          </div>
          <div style={{ background: "white", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <Shield color="#dc2626" style={{ marginBottom: 8 }} />
            <h3>Free Ambulance</h3>
            <p style={{ fontSize: 14, color: "#64748b" }}>No cost emergency transport</p>
          </div>
          <div style={{ background: "white", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <Heart color="#dc2626" style={{ marginBottom: 8 }} />
            <h3>Expert Team</h3>
            <p style={{ fontSize: 14, color: "#64748b" }}>Critical care specialists</p>
          </div>
        </div>

        {/* Address */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #e2e8f0" }}>
          <MapPin size={20} color="#64748b" style={{ display: "inline", marginRight: 8 }} />
          <span style={{ color: "#475569" }}>Abd Hind MediCare, New Delhi, India</span>
        </div>
      </div>
    </div>
  );
}