"use client";
import { Shield, CreditCard, FileText, CheckCircle, Phone, Wallet, Building, Users, Star, Clock, ThumbsUp, HelpCircle, ArrowRight, Hospital, Heart, Stethoscope } from "lucide-react";

export default function InsurancePage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f0f9ff", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", 
        color: "white", 
        padding: "60px 20px 80px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Hospital size={56} style={{ marginBottom: 16, opacity: 0.9 }} />
          <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", marginBottom: 16, fontWeight: 700 }}>
            Insurance & <span style={{ color: "#fbbf24" }}>Cashless</span> Treatment
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.95, maxWidth: 600, margin: "0 auto" }}>
            We partner with all major insurance providers for hassle-free cashless hospitalization
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "-40px auto 0", padding: "0 20px 60px" }}>
        
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { value: "50+", label: "Insurance Partners", icon: Building },
            { value: "10,000+", label: "Cashless Claims", icon: ThumbsUp },
            { value: "24/7", label: "Claim Support", icon: Clock },
            { value: "98%", label: "Approval Rate", icon: Star },
          ].map((stat, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: 16, textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <stat.icon size={28} color="#2563eb" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1e3a8a" }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Insurance Partners Grid */}
        <div style={{ background: "white", borderRadius: 24, padding: "40px 32px", marginBottom: 48, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>Our Insurance Partners</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {[
              "Star Health & Allied Insurance",
              "Niva Bupa Health Insurance",
              "HDFC ERGO General Insurance",
              "ICICI Lombard General Insurance",
              "Bajaj Allianz General Insurance",
              "Care Health Insurance",
              "Aditya Birla Health Insurance",
              "ManipalCigna Health Insurance",
              "Reliance General Insurance",
              "SBI General Insurance",
              "Tata AIG General Insurance",
              "National Insurance Company",
              "New India Assurance",
              "Oriental Insurance",
              "United India Insurance"
            ].map(ins => (
              <div key={ins} style={{ 
                background: "#f8fafc", 
                padding: "10px 20px", 
                borderRadius: 40, 
                fontSize: 13, 
                fontWeight: 500,
                color: "#1e293b",
                border: "1px solid #e2e8f0"
              }}>
                {ins}
              </div>
            ))}
          </div>
        </div>

        {/* How Cashless Works */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>How Cashless Treatment Works</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: 40 }}>Simple 4-step process for hassle-free hospitalization</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { step: "1", title: "Share Insurance Details", desc: "Provide your insurance card and valid ID proof at admission", icon: FileText },
              { step: "2", title: "We Verify Coverage", desc: "Our team contacts your insurer for pre-authorization", icon: Shield },
              { step: "3", title: "Treatment Begins", desc: "You focus on recovery while we handle paperwork", icon: Heart },
              { step: "4", title: "Cashless Settlement", desc: "Insurance company settles bill directly with hospital", icon: CreditCard },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", padding: 28, borderRadius: 20, position: "relative", border: "1px solid #e2e8f0" }}>
                <div style={{ 
                  background: "#2563eb", 
                  color: "white", 
                  width: 40, 
                  height: 40, 
                  borderRadius: 40, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 18,
                  marginBottom: 20
                }}>
                  {item.step}
                </div>
                <item.icon size={24} color="#2563eb" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage & Documents */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32, marginBottom: 48 }}>
          
          {/* What's Covered */}
          <div style={{ background: "white", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={24} color="#10b981" />
              What's Covered
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[
                "Room rent (up to policy limit)",
                "ICU & ICCU charges",
                "Surgeon & doctor fees",
                "Medicines & consumables",
                "Diagnostic tests & radiology",
                "OT & anesthesia charges",
                "Ambulance charges",
                "Pre & post hospitalization expenses"
              ].map(item => (
                <li key={item} style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f1f5f9" }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span style={{ fontSize: 14 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documents Required */}
          <div style={{ background: "white", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={24} color="#f59e0b" />
              Documents Required
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[
                "Insurance card / e-card",
                "Valid government ID proof (Aadhar/PAN/Driving License)",
                "Doctor's prescription / referral",
                "Previous medical records (if any)",
                "FIR copy (for accident cases)",
                "Claim form (provided by hospital)"
              ].map(item => (
                <li key={item} style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f1f5f9" }}>
                  <CheckCircle size={14} color="#f59e0b" />
                  <span style={{ fontSize: 14 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Government Schemes */}
        <div style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderRadius: 20, padding: "32px 40px", marginBottom: 48 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={28} color="#d97706" />
            Government Health Schemes Accepted
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {[
              "Ayushman Bharat - PMJAY",
              "CGHS (Central Govt Health Scheme)",
              "ECHS (Ex-Servicemen Contributory Health Scheme)",
              "ESIC (Employees State Insurance)",
              "State Government Health Schemes",
              "Railway Health Scheme"
            ].map(scheme => (
              <span key={scheme} style={{ background: "white", padding: "8px 18px", borderRadius: 40, fontSize: 13, fontWeight: 500 }}>{scheme}</span>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>Frequently Asked Questions</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { q: "Is pre-authorization required for cashless treatment?", a: "Yes, for planned admissions we recommend getting pre-authorization 24-48 hours before admission. For emergencies, we can process it after admission." },
              { q: "What if my insurance claim gets rejected?", a: "Our insurance team will help you understand the reason and assist with re-submission or alternative payment options." },
              { q: "Do you accept international travel insurance?", a: "Yes, we accept most international travel insurance plans. Please share your policy details with our team for verification." },
              { q: "How long does the cashless approval take?", a: "Typically 2-4 hours for planned admissions. Emergency approvals are processed faster." },
              { q: "Can I use insurance for OPD/consultation?", a: "Coverage varies by policy. Some plans include OPD benefits. Check with your insurer or our helpdesk." },
            ].map((faq, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: "20px 24px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <HelpCircle size={20} color="#2563eb" />
                  <strong style={{ fontSize: 16 }}>{faq.q}</strong>
                </div>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 0 32px" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "#1e3a8a", borderRadius: 24, padding: "48px 32px", textAlign: "center", color: "white" }}>
          <Phone size={48} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 24, marginBottom: 12 }}>Need Assistance With Insurance?</h3>
          <p style={{ marginBottom: 24, opacity: 0.9 }}>Our dedicated insurance helpdesk is available 24/7 to assist you</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+919876543210" style={{ background: "#f59e0b", color: "white", padding: "14px 32px", borderRadius: 50, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Phone size={18} />
              Call Insurance Helpdesk
            </a>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "14px 32px", borderRadius: 50, fontWeight: 600 }}>
              📧 insurance@abhindmedicare.com
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}