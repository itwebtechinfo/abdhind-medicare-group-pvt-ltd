"use client";
import { Microscope, FlaskConical, Clock, Truck, Shield, Phone, Star, CheckCircle2, MapPin, CreditCard, FileText, Heart, Activity, Brain, Droplet, Bone, Eye, Ear, Baby, Users, Award, Calendar, Syringe, Scan, TestTube, Zap } from "lucide-react";

export default function DiagnosticsPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)", 
        color: "white", 
        padding: "50px 20px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Microscope size={56} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", marginBottom: 12, fontWeight: 700 }}>
            Advanced Diagnostics
          </h1>
          <p style={{ fontSize: 18, opacity: 0.95 }}>Accurate reports • Fast results • Home sample collection</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-30px auto 0", padding: "0 20px 60px" }}>
        
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { value: "500+", label: "Test Types", icon: TestTube },
            { value: "24 Hrs", label: "Report Time", icon: Clock },
            { value: "Free", label: "Home Collection", icon: Truck },
            { value: "NABL", label: "Accredited Lab", icon: Award },
          ].map((stat, i) => (
            <div key={i} style={{ background: "white", padding: 20, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <stat.icon size={28} color="#7c3aed" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32, marginBottom: 48 }}>
          
          {/* Left - Features */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Why Choose Our Diagnostics?</h2>
            <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
              {[
                { icon: Award, title: "NABL Accredited Lab", desc: "National accreditation for quality testing" },
                { icon: Clock, title: "Fast Reports", desc: "24-48 hours report delivery" },
                { icon: Truck, title: "Free Home Collection", desc: "Free sample pickup from your home" },
                { icon: Shield, title: "Accurate Results", desc: "Advanced equipment & qualified staff" },
                { icon: Zap, title: "Digital Reports", desc: "View reports online anytime" },
                { icon: Users, title: "Expert Pathologists", desc: "Experienced doctors verify every report" },
              ].map((feat, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 5 ? "1px solid #e2e8f0" : "none" }}>
                  <div style={{ background: "#f5f3ff", padding: 8, borderRadius: 10, height: 36 }}>
                    <feat.icon size={20} color="#7c3aed" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{feat.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Health Packages */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Popular Health Packages</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { name: "Basic Wellness", price: "₹999", tests: "65+ tests", original: "₹2,500", popular: false },
                { name: "Comprehensive", price: "₹2,499", tests: "85+ tests", original: "₹5,900", popular: true },
                { name: "Executive Plus", price: "₹4,999", tests: "120+ tests", original: "₹9,900", popular: false },
                { name: "Heart Care", price: "₹1,499", tests: "30+ tests", original: "₹3,500", popular: false },
                { name: "Diabetes Care", price: "₹999", tests: "25+ tests", original: "₹2,200", popular: false },
              ].map((pkg, i) => (
                <div key={i} style={{ background: "white", borderRadius: 16, padding: 18, border: pkg.popular ? "2px solid #7c3aed" : "1px solid #e2e8f0", position: "relative" }}>
                  {pkg.popular && (
                    <span style={{ position: "absolute", top: -10, right: 20, background: "#7c3aed", color: "white", padding: "2px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Most Popular</span>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, marginBottom: 4 }}>{pkg.name}</h3>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{pkg.tests} included</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div><span style={{ fontSize: 20, fontWeight: 700, color: "#7c3aed" }}>{pkg.price}</span> <span style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through" }}>{pkg.original}</span></div>
                      <button style={{ background: "#7c3aed", color: "white", border: "none", padding: "6px 16px", borderRadius: 20, fontSize: 12, marginTop: 6, cursor: "pointer" }}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Categories */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Test Categories</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 32 }}>Complete range of diagnostic tests</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { icon: Heart, name: "Cardiac", tests: ["Lipid Profile", "Troponin", "CRP", "CK-MB"] },
              { icon: Droplet, name: "Blood Tests", tests: ["CBC", "Blood Sugar", "HbA1c", "Iron Profile"] },
              { icon: Activity, name: "Liver/Kidney", tests: ["LFT", "KFT", "Uric Acid", "Creatinine"] },
              { icon: Brain, name: "Thyroid/Hormone", tests: ["T3,T4,TSH", "Cortisol", "Prolactin", "Testosterone"] },
              { icon: Baby, name: "Women's Health", tests: ["Pap Smear", "HPV", "AMH", "Vitamin D"] },
              { icon: Syringe, name: "Infectious", tests: ["Dengue", "Malaria", "Typhoid", "COVID"] },
            ].map((cat, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0" }}>
                <div style={{ background: "#f5f3ff", width: 45, height: 45, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <cat.icon size={22} color="#7c3aed" />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 10 }}>{cat.name}</h3>
                {cat.tests.map(test => (
                  <div key={test} style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>✓ {test}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { step: "1", title: "Book Test", desc: "Call or book online for test", icon: Phone },
              { step: "2", title: "Sample Collection", desc: "Visit lab or free home pickup", icon: Syringe },
              { step: "3", title: "Lab Processing", desc: "Advanced equipment testing", icon: Microscope },
              { step: "4", title: "Get Reports", desc: "Digital reports in 24-48 hrs", icon: FileText },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ background: "#7c3aed", color: "white", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontWeight: "bold" }}>{item.step}</div>
                <item.icon size={24} color="#7c3aed" style={{ marginBottom: 8 }} />
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

       

        {/* Why Choose Us */}
        <div style={{ background: "#1e293b", borderRadius: 20, padding: "32px 28px", marginBottom: 48, color: "white" }}>
          <h2 style={{ fontSize: 22, textAlign: "center", marginBottom: 24 }}>Why Abd Hind Diagnostics?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { icon: Award, title: "NABL & ISO Certified", desc: "Internationally accredited lab" },
              { icon: Clock, title: "Quick Turnaround", desc: "Reports within 24-48 hours" },
              { icon: Shield, title: "Accurate Results", desc: "Stringent quality controls" },
              { icon: Users, title: "Expert Team", desc: "Qualified pathologists & technicians" },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <item.icon size={28} color="#a78bfa" />
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        

      </div>
    </div>
  );
}