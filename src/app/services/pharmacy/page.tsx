"use client";
import { Pill, Clock, Truck, Shield, Phone, Star, CheckCircle2, MapPin, CreditCard, Package, AlertCircle, Sun, Moon, Heart, Building2, Users } from "lucide-react";

export default function PharmacyPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", 
        color: "white", 
        padding: "50px 20px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Pill size={56} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", marginBottom: 12, fontWeight: 700 }}>
            Abd Hind Pharmacy
          </h1>
          <p style={{ fontSize: 18, opacity: 0.95 }}>Authentic medicines • Free delivery • 24/7 service</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 0", padding: "0 20px 60px" }}>
        
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { value: "10,000+", label: "Happy Customers", icon: Users },
            { value: "24/7", label: "Service Available", icon: Clock },
            { value: "Free", label: "Home Delivery", icon: Truck },
            { value: "100%", label: "Authentic Medicines", icon: Shield },
          ].map((stat, i) => (
            <div key={i} style={{ background: "white", padding: 20, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <stat.icon size={28} color="#2563eb" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32, marginBottom: 48 }}>
          
          {/* Left - Features */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Why Choose Our Pharmacy?</h2>
            <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
              {[
                { icon: Shield, title: "100% Authentic Medicines", desc: "Direct from licensed manufacturers and distributors" },
                { icon: Truck, title: "Free Home Delivery", desc: "Free delivery on all orders across the city" },
                { icon: Clock, title: "24/7 Emergency Service", desc: "Always open for your medical needs" },
                { icon: Package, title: "Prescription Reminder", desc: "Timely refill reminders for regular medications" },
                { icon: CreditCard, title: "Easy Payment", desc: "Cash, card, UPI, and insurance accepted" },
                { icon: AlertCircle, title: "Generic Alternatives", desc: "Save up to 80% with generic medicine options" },
              ].map((feat, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 5 ? "1px solid #e2e8f0" : "none" }}>
                  <div style={{ background: "#eff6ff", padding: 8, borderRadius: 10, height: 36 }}>
                    <feat.icon size={20} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{feat.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Order Process */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>How to Order?</h2>
            <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
              {[
                { step: "1", title: "Share Prescription", desc: "Upload or WhatsApp your doctor's prescription" },
                { step: "2", title: "Get Quote", desc: "We'll share medicine prices and delivery time" },
                { step: "3", title: "Confirm Order", desc: "Approve the order and make payment" },
                { step: "4", title: "Fast Delivery", desc: "Get medicines delivered to your doorstep" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" }}>
                  <div style={{ background: "#2563eb", color: "white", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14 }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              
              <div style={{ background: "#eff6ff", padding: 16, borderRadius: 12, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Phone size={16} color="#2563eb" />
                  <span style={{ fontWeight: 600 }}>Order via WhatsApp</span>
                </div>
                <a href="https://wa.me/919876543210" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none", fontSize: 18 }}>+91 95409 29832</a>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Categories */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Medicine Categories</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 32 }}>We stock a wide range of medicines</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            {[
              "Cardiac Care", "Diabetes Care", "Neurology", "Respiratory", 
              "Antibiotics", "Pain Relief", "Vitamins", "Ayurveda", 
              "Pediatrics", "Skin Care", "Eye Care", "Women's Health"
            ].map(cat => (
              <div key={cat} style={{ background: "white", padding: "12px 16px", borderRadius: 40, textAlign: "center", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500 }}>
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Store Locations */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>Our Store Locations</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { name: "Delhi - Main", address: "Sector 44, Noida", timing: "24/7", phone: "+91 95409 29832" },
              { name: "Kushinagar", address: "Kasia, Kushinagar", timing: "8AM - 10PM", phone: "+91 98765 43211" },
            ].map(store => (
              <div key={store.name} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Building2 size={18} color="#2563eb" />
                  <h3 style={{ fontSize: 18 }}>{store.name}</h3>
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>📍 {store.address}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>🕒 {store.timing}</div>
                <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 500 }}>📞 {store.phone}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Section */}
        <div style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderRadius: 20, padding: "28px 24px", marginBottom: 48, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Save on Your Medicines</h3>
          <p style={{ color: "#92400e", marginBottom: 16 }}>Get up to 80% off on generic alternatives • Free delivery on orders above ₹500</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ background: "#92400e", color: "white", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Senior Citizen Discount</span>
            <span style={{ background: "#92400e", color: "white", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>First Order 10% Off</span>
            <span style={{ background: "#92400e", color: "white", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>Monthly Refill Savings</span>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "#1e3a8a", borderRadius: 20, padding: "32px 24px", textAlign: "center", color: "white" }}>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>Need Medicines?</h3>
          <p style={{ marginBottom: 20, opacity: 0.9 }}>Order now for free home delivery</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+919876543210" style={{ background: "#f59e0b", color: "white", padding: "12px 28px", borderRadius: 40, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Phone size={18} />
              Call to Order
            </a>
            <a href="https://wa.me/919876543210" style={{ background: "rgba(255,255,255,0.2)", padding: "12px 28px", borderRadius: 40, textDecoration: "none", fontWeight: 600 }}>
              📱 Order on WhatsApp
            </a>
          </div>
          <p style={{ fontSize: 12, marginTop: 20, opacity: 0.7 }}>Prescription mandatory for scheduled drugs</p>
        </div>

      </div>
    </div>
  );
}