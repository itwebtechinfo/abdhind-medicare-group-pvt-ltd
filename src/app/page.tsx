"use client";
import {
  Heart,
  Stethoscope,
  Pill,
  Microscope,
  Star,
  Users,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Building2,
  Zap,
  Shield,
  Globe,
  Trophy,
  CheckCircle2,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect, useRef, RefObject } from "react";

const useInView = (
  threshold = 0.1,
): [RefObject<HTMLElement | null>, boolean] => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// Logo component with fallback emoji - ZERO extra space
const NodeLogo = ({
  src,
  emoji,
  size = 40,
  className = "",
}: {
  src?: string;
  emoji: string;
  size?: number;
  className?: string;
}) => {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt="logo"
        style={{
          display: "block",
          width: "auto",
          height: "auto",
          maxWidth: size,
          maxHeight: size,
          objectFit: "contain",
          // objectPosition: "top center",
          margin: 0,
          padding: 0,
          border: 0,
          lineHeight: 0,
          verticalAlign: "top",
        }}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      style={{
        fontSize: size * 0.6,
        lineHeight: 1,
        display: "inline-block",
        margin: 0,
        padding: 0,
      }}
    >
      {emoji}
    </span>
  );
};

export default function Page() {
  const [heroRef, heroIn] = useInView(0.05);
  const [servRef, servIn] = useInView(0.1);
  const [docRef, docIn] = useInView(0.1);
  const [trustRef, trustIn] = useInView(0.1);
  const [ctaRef, ctaIn] = useInView(0.1);

  const [launchRef, launchIn] = useInView(0.1);
  const [offerRef, offerIn] = useInView(0.1);
  const [productsRef, productsIn] = useInView(0.1);
  const [whyRef, whyIn] = useInView(0.1);
  const [bottomCtaRef, bottomCtaIn] = useInView(0.1);

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#f7f9f8",
        minHeight: "100vh",
        color: "#1a1a2e",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#ffffff",
          color: "#0f172a",
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.3px",
          padding: "1px 1px",
          // borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="marquee-track">
          ⭐{" "}
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>5.0 Rated</span>{" "}
          by Patients • 🌿{" "}
          <span style={{ color: "#059669" }}>Expert-Led Healthcare</span> • ❤️
          Patient-First Care • 🛡{" "}
          <span style={{ color: "#2563eb" }}>Strict Safety & Hygiene</span> • 💬
          WhatsApp Support • 📞{" "}
          <span style={{ color: "#dc2626", fontWeight: 700 }}>Call Now</span>:
          +91 95409 29832
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400;1,700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeScale {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes drawLine {
          0% { stroke-dashoffset: 500; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 2px #10b981) drop-shadow(0 0 4px rgba(16,185,129,0.3)); }
          50% { filter: drop-shadow(0 0 10px #10b981) drop-shadow(0 0 20px rgba(16,185,129,0.6)); }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        .anim { animation: fadeUp 0.6s ease both; }
        .node-anim { animation: fadeScale 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .card-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.10) !important; }
        .btn-primary {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white; border: none; cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
        }
        .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(16,185,129,0.35); }
        .btn-outline { background: white; color: #059669; border: 1.5px solid #a7f3d0; cursor: pointer; transition: all 0.25s ease; }
        .btn-outline:hover { background: #f0fdf4; }
        .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .tag-green { background: #d1fae5; color: #065f46; }
        .tag-amber { background: #fef3c7; color: #92400e; }
        .tag-gray  { background: #f3f4f6; color: #4b5563; }
        .divider { width: 44px; height: 3px; background: linear-gradient(90deg,#10b981,#6ee7b7); border-radius: 2px; }
        a { text-decoration: none; }
        
        /* Tree Structure - No padding/margin */
        .tree-section {
          margin: 0;
          padding: 0;
          background: white;
          border-bottom: 1px solid #e5f0eb;
        }
        
        .tree-wrapper {
          position: relative;
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          padding: 4px !important;
        }
        
        .tree-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100%;
          width: 100%;
        }
        
        /* Parent Node */
        .parent-node {
          position: relative;
          z-index: 20;
          margin-bottom: 15px;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        
        .parent-card {
          background: linear-gradient(150deg, #f0fdf4, #ffffff);
          border: 2px solid #10b981;
          border-radius: 28px;
          padding: 24px 28px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 12px 40px rgba(16,185,129,0.15);
          text-align: center;
          transition: all 0.3s ease;
        }
        .parent-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(16,185,129,0.25);
          border-color: #059669;
        }
        
        /* SVG Connectors - Desktop - HIGHLIGHTED */
        .desktop-connectors {
          display: block;
          width: 100%;
          max-width: 1100px;
          overflow: visible;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }
        
        .connector-path {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        /* Mobile Connectors - Tree lines with glow */
        .mobile-connectors {
          display: none;
          width: 100%;
          padding: 15px 0;
          position: relative;
          z-index: 5;
        }
        
        .mobile-stem-line {
          width: 3px;
          height: 45px;
          background: linear-gradient(to bottom, #10b981, #059669);
          margin: 0 auto;
          animation: drawLine 0.5s ease-out;
          box-shadow: 0 0 8px rgba(16,185,129,0.6);
        }
        
        .mobile-horizontal-line {
          height: 3px;
          background: linear-gradient(90deg, #a7f3d0, #10b981, #059669, #10b981, #a7f3d0);
          margin: 8px auto;
          width: 85%;
          animation: drawLine 0.6s ease-out;
          box-shadow: 0 0 6px rgba(16,185,129,0.5);
        }
        
        .mobile-branch-line {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 5px 0;
        }
        
        .mobile-branch {
          width: 3px;
          height: 35px;
          background: #10b981;
          animation: drawLine 0.4s ease-out;
          box-shadow: 0 0 6px rgba(16,185,129,0.5);
        }
        
        /* Children Grid */
        .children-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
          margin-top: 20px;
          position: relative;
          z-index: 10;
        }
        
        /* Child Cards */
        .child-card {
          background: white;
          border-radius: 20px;
          padding: 18px 14px;
          transition: all 0.3s ease;
          border: 1.5px solid #e5f0eb;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          animation: fadeScale 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .child-card:nth-child(1) { animation-delay: 0.15s; }
        .child-card:nth-child(2) { animation-delay: 0.25s; }
        .child-card:nth-child(3) { animation-delay: 0.35s; }
        .child-card:nth-child(4) { animation-delay: 0.45s; }
        
        .child-card.green { border-top: 3px solid #10b981; }
        .child-card.purple { border-top: 3px solid #a78bfa; }
        .child-card.blue { border-top: 3px solid #22d3ee; }
        .child-card.brown { border-top: 3px solid #f97316; }
        
        .child-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        /* Trophy Badge */
        .trophy-badge {
          position: absolute;
          top: -12px;
          right: 12px;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          border-radius: 999px;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 3px 10px rgba(245,158,11,0.3);
          z-index: 2;
        }
        
        /* Logo container - zero spacing */
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          font-size: 0;
          margin: 0;
          padding: 0;
        }
        
        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .children-grid {
            gap: 16px;
            min-width: 800px;
          }
          .parent-card {
            max-width: 480px;
            padding: 20px 24px;
          }
          .desktop-connectors {
            min-width: 800px;
          }
        }
        
        @media (max-width: 768px) {
          .tree-wrapper {
            overflow-x: visible;
            padding: 1px !important;
          }
          .children-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            min-width: auto;
          }
          .desktop-connectors {
            display: none;
          }
          .mobile-connectors {
            display: block;
          }
          .parent-card {
            max-width: 100%;
            padding: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .parent-card {
            padding: 16px;
          }
          .parent-card h3 {
            font-size: 20px;
          }
          .child-card {
            padding: 16px 12px;
          }
          .mobile-branch-line {
            gap: 20px;
          }
        }
        
        .tree-wrapper::-webkit-scrollbar {
          height: 4px;
        }
        .tree-wrapper::-webkit-scrollbar-track {
          background: #e5f0eb;
          border-radius: 10px;
        }
        .tree-wrapper::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        
        /* ========= FIXED CSS FOR FOUNDER-LED HEALTHCARE GROUP SECTION ONLY ========= */
        .founder-hero-section {
          background: linear-gradient(145deg, #f8fafc, #ffffff 60%, #f1f5f9);
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
        }
        
        .founder-hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: clamp(32px, 5vw, 64px);
          align-items: center;
        }
        
        .founder-hero-left {
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
        }
        
        .founder-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          padding: 6px 14px;
          margin-bottom: 20px;
        }
        
        .founder-hero-badge-dot {
          width: 6px;
          height: 6px;
          background: #1976d2;
          border-radius: 50%;
        }
        
        .founder-hero-badge-text {
          font-size: 11px;
          font-weight: 700;
          color: #1976d2;
          letter-spacing: 0.08em;
        }
        
        .founder-hero-title {
          line-height: 1.1;
          margin: 0 0 12px;
          font-weight: 800;
        }
        
        .founder-hero-main-brand {
          display: block;
          font-size: clamp(34px, 8vw, 60px);
          letter-spacing: -0.02em;
        }
        
        .founder-hero-sub-text {
          display: block;
          font-size: 12px;
          letter-spacing: 0.25em;
          color: #9ca3af;
          font-weight: 600;
          margin-top: 6px;
        }
        
        .founder-hero-subheading {
          font-size: clamp(15px, 3.5vw, 17px);
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }
        
        .founder-hero-description {
          color: #6b7280;
          font-size: clamp(13px, 3vw, 15px);
          line-height: 1.7;
          margin-bottom: 24px;
          max-width: 520px;
        }
        
        .founder-hero-doctor-highlight {
          font-size: 12px;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 30px;
        }
        
        .founder-hero-stats {
          display: flex;
          gap: 32px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }
        
        .founder-hero-stat-item {
          text-align: left;
        }
        
        .founder-hero-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #1976d2;
          margin: 0;
        }
        
        .founder-hero-stat-label {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 3px;
        }
        
        .founder-hero-right {
          position: relative;
        }
        
        .founder-hero-image-wrapper {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.1);
        }
        
        .founder-hero-image {
          width: 100%;
          display: block;
        }
        
        .founder-hero-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(25, 118, 210, 0.85), transparent);
          padding: 20px;
        }
        
        .founder-hero-overlay-title {
          color: white;
          font-weight: 700;
          font-size: 16px;
          margin: 0;
        }
        
        .founder-hero-overlay-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          margin-top: 4px;
        }
        
        .founder-hero-floating-badge {
          position: absolute;
          top: -14px;
          right: -14px;
          background: white;
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .founder-hero-rating-badge {
          position: absolute;
          bottom: 70px;
          left: -10px;
          background: white;
          border-radius: 12px;
          padding: 10px 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .founder-hero-bg-glow {
          position: absolute;
          right: -100px;
          top: -100px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(25, 118, 210, 0.08), transparent 70%);
          pointer-events: none;
        }
        
        /* Mobile responsive fixes for Founder-Led section */
        @media (max-width: 768px) {
          .founder-hero-section {
            padding: 40px 16px;
          }
          
          .founder-hero-container {
            gap: 24px;
          }
          
          .founder-hero-stats {
            gap: 20px;
          }
          
          .founder-hero-floating-badge {
            top: -8px;
            right: -8px;
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .founder-hero-rating-badge {
            bottom: 50px;
            left: -5px;
            padding: 8px 12px;
            font-size: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .founder-hero-section {
            padding: 32px 12px;
          }
          
          .founder-hero-badge {
            padding: 4px 10px;
            margin-bottom: 16px;
          }
          
          .founder-hero-badge-text {
            font-size: 10px;
          }
          
          .founder-hero-stats {
            gap: 16px;
            padding-top: 16px;
          }
          
          .founder-hero-stat-value {
            font-size: 22px;
          }
          
          .founder-hero-floating-badge,
          .founder-hero-rating-badge {
            display: none;
          }
        }
        /* ========= END FIXED CSS FOR FOUNDER-LED SECTION ========= */
      `}</style>

      {/* ═══ TREE SECTION - ZERO TOP PADDING/MARGIN ═══ */}
      <div className="tree-section">
        <div className="tree-wrapper">
          <div className="tree-container">
            {/* PARENT NODE */}
            <div
              className="parent-node node-anim"
              style={{ animationDelay: "0s" }}
            >
              <div className="parent-card card-lift">
                <div
                  className="logo-container"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1px",
                    lineHeight: 0,
                    fontSize: 0,
                  }}
                >
                  <NodeLogo src="/logo.png" emoji="🏥" size={250} />
                </div>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "clamp(11px, 2.8vw, 13px)",
                    lineHeight: 1.65,
                    margin: "0 0 18px",
                  }}
                >
                  A comprehensive healthcare ecosystem delivering excellence
                  across clinical care, diagnostics, manufacturing, and future
                  healthcare innovations —{" "}
                  <span style={{ color: "#FF0000", fontWeight: 600 }}>
                    &quot;Your problem, our care — restoring natural health with
                    satisfaction&quot;.
                  </span>
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                    gap: "10px",
                    background: "#f8fffe",
                    borderRadius: 14,
                    padding: "12px 14px",
                    textAlign: "left",
                  }}
                >
                  {[
                    ["Division", "Abd Hind MediCare"],
                    ["Address", "Jama Masjid, Delhi"],
                    ["GST No.", "07ABFCA1118C1ZC"],
                    ["CIN. No.", "U86100DC2026PTC469435"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "8px",
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          margin: "0 0 2px",
                        }}
                      >
                        {k}
                      </p>
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#374151",
                          fontWeight: 600,
                          margin: 0,
                          lineHeight: "1.2",
                        }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP SVG CONNECTORS - HIGHLIGHTED WITH GLOW */}
            <svg
              className="desktop-connectors"
              height="170"
              viewBox="0 0 1100 170"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="25%" stopColor="#059669" stopOpacity="1" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="75%" stopColor="#059669" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glowFilter">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Curved paths from parent (550,0) to children - with glow */}
              <path
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                className="connector-path"
                strokeDasharray="500"
                strokeDashoffset="500"
                style={{
                  animation: "drawLine 0.6s ease-out forwards",
                  filter: "url(#glowFilter)",
                }}
                d="M550,0 C550,75 137,75 137,170"
              />
              <path
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                className="connector-path"
                strokeDasharray="500"
                strokeDashoffset="500"
                style={{
                  animation: "drawLine 0.7s ease-out forwards",
                  filter: "url(#glowFilter)",
                }}
                d="M550,0 C550,75 412,75 412,170"
              />
              <path
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                className="connector-path"
                strokeDasharray="500"
                strokeDashoffset="500"
                style={{
                  animation: "drawLine 0.8s ease-out forwards",
                  filter: "url(#glowFilter)",
                }}
                d="M550,0 C550,75 688,75 688,170"
              />
              <path
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                className="connector-path"
                strokeDasharray="500"
                strokeDashoffset="500"
                style={{
                  animation: "drawLine 0.9s ease-out forwards",
                  filter: "url(#glowFilter)",
                }}
                d="M550,0 C550,75 963,75 963,170"
              />

              {/* Connection nodes - pulsing dots */}
              <circle cx="550" cy="0" r="6" fill="#059669" opacity="0">
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.5s"
                  fill="freeze"
                />
                <animate
                  attributeName="r"
                  values="4;8;4"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="137" cy="170" r="5" fill="#10b981" opacity="0">
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.6s"
                  fill="freeze"
                />
                <animate
                  attributeName="r"
                  values="3;6;3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="412" cy="170" r="5" fill="#10b981" opacity="0">
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.7s"
                  fill="freeze"
                />
                <animate
                  attributeName="r"
                  values="3;6;3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="688" cy="170" r="5" fill="#10b981" opacity="0">
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.8s"
                  fill="freeze"
                />
                <animate
                  attributeName="r"
                  values="3;6;3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="963" cy="170" r="5" fill="#10b981" opacity="0">
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.9s"
                  fill="freeze"
                />
                <animate
                  attributeName="r"
                  values="3;6;3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* MOBILE CONNECTORS - Tree lines with glow */}
            <div className="mobile-connectors">
              <div className="mobile-stem-line"></div>
              <div className="mobile-horizontal-line"></div>
              <div className="mobile-branch-line">
                <div className="mobile-branch"></div>
                <div className="mobile-branch"></div>
                <div className="mobile-branch"></div>
                <div className="mobile-branch"></div>
              </div>
            </div>

            {/* CHILDREN NODES */}
            <div className="children-grid">
              {/* MR Dental Clinic */}
              <div
                className="child-card card-lift"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
              >
                {/* Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "linear-gradient(135deg,#d32f2f,#1976d2)",
                    borderRadius: 40,
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    zIndex: 2,
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  🏆 Best Clinic
                </div>

                {/* Logo */}
                <div style={{ display: "flex" }}>
                  <NodeLogo src="/mr_dental_clinic.png" emoji="🦷" size={300} />
                </div>

                {/* Doctor Info */}
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      margin: 0,
                      color: "#111827",
                    }}
                  >
                    DR. EKHLAQ AHMED
                  </p>

                  <p
                    style={{
                      fontSize: "11px",
                      color: "#1976d2",
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    (DENTAL SURGEON)
                  </p>

                  {/* <p style={{ fontSize: "11px", margin: 0, fontWeight: 600 }}>
                    B.D.S • M.I.D.A
                  </p> */}

                  <p style={{ fontSize: "10px", color: "#4b5563", margin: 0 }}>
                    Jamia Millia Islamia
                  </p>

                  <p style={{ fontSize: "9px", color: "#9ca3af", margin: 0 }}>
                    (Central Government University)
                  </p>
                </div>

                {/* Experience */}
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg,#d32f2f,#1976d2)",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    ⚡ 10+ Years Experience
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textAlign: "center",
                    marginBottom: 10,
                    padding: "0 8px",
                  }}
                >
                  Regenerative dentistry focused on saving natural teeth,
                  advanced implants, painless RCT & smile design.
                </p>

                {/* 🔥 CERTIFICATE BLOCK */}
                <div
                  style={{
                    padding: "8px",
                    border: "1px solid #dbeafe",
                    borderRadius: 8,
                    background: "#f8fbff",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ textAlign: "center", margin: "6px 0" }}>
                    <p
                      style={{
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "#1e3a8a",
                        letterSpacing: "0.08em",
                        margin: 0,
                      }}
                    >
                      CERTIFIED BY
                    </p>

                    <div
                      style={{
                        width: 40,
                        height: 1,
                        background: "#93c5fd",
                        margin: "3px auto 0",
                      }}
                    />
                  </div>

                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    {/* Top Line */}
                    <p
                      style={{
                        fontSize: "8px",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: "#1976d2" }}>AMR Cipla</span>
                      <span style={{ color: "#9ca3af" }}> + </span>
                      <span style={{ color: "#d32f2f", fontWeight: 700 }}>
                        The Times of India
                      </span>
                    </p>

                    {/* Bottom Line */}
                    <p
                      style={{
                        fontSize: "7px",
                        color: "#6b7280",
                        marginTop: 2,
                        letterSpacing: "0.04em",
                      }}
                    >
                      IN ASSOCIATION WITH
                    </p>
                  </div>
                </div>

                {/* Certifications */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <span className="tag tag-blue">dti (USA)</span>
                  <span className="tag tag-green">ADA</span>
                  <span className="tag tag-purple">ICDE</span>
                  <span className="tag tag-amber">IDA Member</span>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 12,
                    borderTop: "1px solid #e5e7eb",
                    gap: "6px",
                  }}
                >
                  {/* Location */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: "10px",
                      color: "#6b7280",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin
                      style={{ width: 11, height: 11, color: "#9ca3af" }}
                    />
                    <span>Jama Masjid, Delhi</span>
                  </div>

                  {/* CTA Buttons Block - Bright Logo Color Matched */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      flexShrink: 0,
                    }}
                  >
                    {/* Visit Text */}
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#4b5563",
                        letterSpacing: "0.2px",
                      }}
                    >
                      Visit:
                    </span>

                    {/* Website Button - Bright Light Cyan Blue (Matches Left Side of Logo) */}
                    <a
                      href="https://www.mrdentalclinic.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700, // Strong text for high readability on light colors
                        color: "white",
                        background: "#00a2e8", // Perfect Bright Light Logo Blue
                        padding: "5px 12px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "background 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#008ecb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#00a2e8")
                      }
                    >
                      Website
                    </a>

                    {/* Clinic Button - Bright Leaf Green (Matches Top Roof of Logo) */}
                    <a
                      href="https://maps.app.goo.gl/zKRihRAZZ7xuxRCq8?g_st=awb"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "white",
                        background: "#22c55e", // Pure Vibrant Logo Green
                        padding: "5px 12px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "background 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#16a34a")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#22c55e")
                      }
                    >
                      Clinic
                    </a>
                  </div>
                </div>
              </div>
              {/* ================= Multi-Speciality Healthcare ================= */}
              <div className="child-card purple card-lift">
                <div
                  className="logo-container"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <NodeLogo
                    // src="/multispeciality-logo.png"
                    emoji="🏨"
                    size={30}
                  />
                </div>

                <h4
                  style={{ fontSize: "18px", fontWeight: 700, marginBottom: 4 }}
                >
                  Multi-Speciality Healthcare
                </h4>

                <div
                  style={{
                    display: "inline-block",
                    background: "#f59e0b20",
                    color: "#b45309",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  Launching Soon
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  Integrated healthcare ecosystem covering physician,
                  gynaecologist, pediatrics, ENT, ophthalmologists, dermatology
                  (skin care), and advanced diagnostics services under one roof.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <span className="tag tag-purple">Integrated Care</span>
                  <span className="tag tag-blue">Modern Infra</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #eee",
                    paddingTop: 10,
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    Q2 2025
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#7c3aed",
                    }}
                  >
                    Coming →
                  </span>
                </div>
              </div>

              {/* ================= Diagnostic Lab ================= */}
              <div className="child-card blue card-lift">
                <div
                  className="logo-container"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <NodeLogo
                    // src="/diagnostic-logo.png"
                    emoji="🔬"
                    size={30}
                  />
                </div>

                <h4
                  style={{ fontSize: "18px", fontWeight: 700, marginBottom: 4 }}
                >
                  Diagnostic Lab
                </h4>

                <div
                  style={{
                    display: "inline-block",
                    background: "#0ea5e920",
                    color: "#0369a1",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  Advanced Setup
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  High-precision pathology and radiology with modern equipment
                  for fast, reliable diagnostics.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <span className="tag tag-blue">AI Diagnostics</span>
                  <span className="tag tag-purple">High Accuracy</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #eee",
                    paddingTop: 10,
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    Multi Location
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#0891b2",
                      fontWeight: 600,
                    }}
                  >
                    Soon →
                  </span>
                </div>
              </div>

              {/* ================= Pharmacy Hub ================= */}
              <div className="child-card brown card-lift">
                <div
                  className="logo-container"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#2563eb,#60a5fa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <NodeLogo
                    //  src="/pharmacy-logo.png"
                    emoji="💊"
                    size={30}
                  />
                </div>

                <h4
                  style={{ fontSize: "18px", fontWeight: 700, marginBottom: 4 }}
                >
                  Pharmacy Hub
                </h4>

                <div
                  style={{
                    display: "inline-block",
                    background: "#2563eb20",
                    color: "#1d4ed8",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  24/7 Service
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  Genuine medicines, digital prescriptions, and fast delivery
                  with 24/7 pharmacy support across India.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <span className="tag tag-blue">24/7 Access</span>
                  <span className="tag tag-green">Trusted Supply</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #eee",
                    paddingTop: 10,
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    Pan-India
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    Soon →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========= FOUNDER-LED HEALTHCARE GROUP SECTION (FIXED) ========= */}
      <section
        ref={heroRef}
        className="founder-hero-section"
        aria-labelledby="founder-hero-title"
      >
        {/* Background Glow (SEO-friendly, decorative) */}
        <div className="founder-hero-bg-glow" aria-hidden="true" />

        <div className="founder-hero-container">
          {/* LEFT CONTENT */}
          <div
            className="founder-hero-left"
            style={{ opacity: heroIn ? 1 : 0 }}
          >
            {/* Tag */}
            <div className="founder-hero-badge">
              <div className="founder-hero-badge-dot" aria-hidden="true" />
              <span className="founder-hero-badge-text">
                Founder-Led Healthcare Group
              </span>
            </div>

            {/* Heading */}
            <h1 id="founder-hero-title" className="founder-hero-title">
              <span className="founder-hero-main-brand">
                <span style={{ color: "#38bdf8" }}>Abd Hind </span>
                <span style={{ color: "#4ade80" }}>MediCare</span>
              </span>
              <span className="founder-hero-sub-text">GROUP PVT. LTD.</span>
            </h1>

            {/* Subheading */}
            <p className="founder-hero-subheading">
              Clinical Care • Diagnostics • Manufacturing • Future Healthcare
            </p>

            {/* Description */}
            <p className="founder-hero-description">
              Inspired by my father’s unwavering dedication, resilience, and
              visionary spirit, Abd Hind MediCare Group was founded on the
              principles of integrity, compassion, perseverance, and excellence.
              His tireless commitment to serving people laid the foundation of
              our journey and continues to inspire us in advancing clinical
              care, precision diagnostics, medical manufacturing, and future
              healthcare innovations — all driven by a mission to build a
              healthier tomorrow.
            </p>

            {/* Doctor Highlight */}
            <p className="founder-hero-doctor-highlight">
              Led by Dr. Ekhlaq Ahmed • 10+ Years Clinical Experience
            </p>

            {/* Stats (SEO-friendly with semantic markup) */}
            <div className="founder-hero-stats">
              {[
                ["48K+", "Procedures (MR Dental Clinic)"],
                ["10+", "Years Experience"],
                ["5.0★", "Google Rating"],
              ].map(([value, label]) => (
                <div key={label} className="founder-hero-stat-item">
                  <p className="founder-hero-stat-value">{value}</p>
                  <p className="founder-hero-stat-label">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT - IMAGE */}
          <div className="founder-hero-right">
            <div className="founder-hero-image-wrapper">
              <img
                src="/heroSection.jpeg"
                alt="Abd Hind MediCare - Founder-led healthcare ecosystem"
                className="founder-hero-image"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="founder-hero-image-overlay">
                <p className="founder-hero-overlay-title">
                  Future-Ready Healthcare Ecosystem
                </p>
                <p className="founder-hero-overlay-subtitle">
                  Est. 2017 • Founder Driven
                </p>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="founder-hero-floating-badge" aria-hidden="true">
              🏆 Trusted Network
            </div>

            {/* Rating Badge */}
            <div className="founder-hero-rating-badge" aria-hidden="true">
              ⭐ 5.0 Rating
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section
        ref={servRef as React.RefObject<HTMLElement>}
        // style={{
        //   // padding: "clamp(48px, 8vw, 80px) 20px",
        //   background: "#f7f9f8",
        // }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{ textAlign: "center", marginBottom: 52 }}
            className={servIn ? "anim" : ""}
          >
            <div className="divider" style={{ margin: "0 auto 16px" }} />
            <h2
              style={{
                fontSize: "clamp(28px, 6vw, 34px)",
                fontWeight: 800,
                margin: "0 0 10px",
              }}
            >
              Comprehensive{" "}
              <span
                className="serif"
                style={{
                  fontStyle: "italic",
                  color: "#059669",
                  fontWeight: 700,
                }}
              >
                Healthcare
              </span>{" "}
              Services
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "clamp(12px, 3vw, 14px)",
                maxWidth: 460,
                margin: "0 auto",
              }}
            >
              Delivering excellence across multiple specialities with a
              patient-centric approach.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: Stethoscope,
                title: "Dental Care",
                desc: "*Complete dental solutions* — implants, orthodontics, cosmetic dentistry, root canals, teeth cleaning, smile designing, pediatric care, and routine checkups.",
                accent: "#059669",
                bg: "#f0fdf4",
                delay: "0s",
              },
              {
                icon: Microscope,
                title: "Diagnostics",
                desc: "Advanced pathology and radiology with quick, accurate, and reliable reports.",
                accent: "#0891b2",
                bg: "#f0f9ff",
                delay: "0.1s",
              },
              {
                icon: Pill,
                title: "Pharmacy",
                desc: "24/7 pharmacy with genuine medicines and convenient nationwide home delivery.",
                accent: "#2563eb",
                bg: "#eff6ff",
                delay: "0.2s",
              },
              {
                icon: Heart,
                title: "Multi-Speciality Healthcare",
                desc: "Physician, gynaecologist, pediatrics, ENT, ophthalmologists, dermatologist (skin care), orthopedics, and advanced diagnostics under one roof.",
                accent: "#7c3aed",
                bg: "#faf5ff",
                delay: "0.3s",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="anim card-lift"
                style={{
                  animationDelay: s.delay,
                  background: "white",
                  border: "1.5px solid #e5f0eb",
                  borderRadius: 20,
                  padding: "clamp(20px, 4vw, 28px) clamp(16px, 3vw, 22px)",
                }}
              >
                <div
                  style={{
                    width: "clamp(44px, 8vw, 50px)",
                    height: "clamp(44px, 8vw, 50px)",
                    background: s.bg,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <s.icon
                    style={{
                      width: "clamp(20px, 4vw, 24px)",
                      height: "clamp(20px, 4vw, 24px)",
                      color: s.accent,
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "clamp(15px, 3.5vw, 16px)",
                    fontWeight: 700,
                    margin: "0 0 10px",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "clamp(12px, 2.8vw, 13px)",
                    color: "#6b7280",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================================= */}
      {/* CONSOLIDATED SECTION: HERO PRODUCT LAUNCH & LIVE OFFER (E-COMMERCE OPTIMIZED)     */}
      {/* ================================================================================= */}
      <section
        ref={launchRef}
        style={{
          width: "100%",
          padding:
            "30px max(15px, calc((100% - 1200px) / 2)) 10px max(15px, calc((100% - 1200px) / 2))",
          background:
            "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.04), transparent 50%), #ffffff",
          overflow: "hidden",
        }}
      >
        <style>{`
          .ecommerce-vertical-layout {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            align-items: center;
          }
          .premium-images-row {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 16px;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
          }
          .image-wrapper-box {
            flex: 1;
            max-width: 420px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          @media (max-width: 600px) {
            .premium-images-row {
              flex-direction: column;
              gap: 12px;
              padding: 0 10px;
            }
            .image-wrapper-box {
              width: 100%;
              max-width: 100%; /* Mobile par fully standard proportion width hold karega */
            }
          }
        `}</style>

        <div className="ecommerce-vertical-layout">
          {/* TOP BLOCK: Original Dimension Proportional Images */}
          <div className="premium-images-row">
            {/* Image 1: Product Specs Poster */}
            <div
              className="image-wrapper-box"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <img
                src="/products/bamboo-toothbrush.jpeg"
                alt="Product Details Showcase"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit:
                    "contain" /* Ensure full image visibility without any structural crops */,
                  display: "block",
                }}
              />
            </div>

            {/* Image 2: Offer Package Poster */}
            <div
              className="image-wrapper-box"
              style={{ border: "1px solid #fecaca" }}
            >
              <img
                src="/products/limited-offer.jpeg"
                alt="Exclusive Offer Matrix"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit:
                    "contain" /* Ensure full image visibility without any structural crops */,
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* BOTTOM BLOCK: Text Framework Layout */}
          <div
            className={launchIn ? "anim" : ""}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              opacity: launchIn ? 1 : 0,
              width: "100%",
              maxWidth: "750px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  color: "#047857",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                🌿 NEW PRODUCT LAUNCH
              </span>
              <span
                style={{
                  background: "#dc2626",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                💥 UP TO 60% OFF
              </span>
            </div>

            <h2
              style={{
                fontSize: "clamp(22px, 3.5vw, 36px)",
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "#0f172a",
                margin: "0 0 6px 0",
              }}
            >
              MR Dental{" "}
              <span
                className="serif"
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  background: "linear-gradient(90deg, #059669, #10b981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Bamboo Toothbrush
              </span>
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: 1.5,
                marginBottom: "16px",
                maxWidth: "600px",
              }}
            >
              Premium bamboo toothbrush crafted with organic charcoal-infused
              ultra soft bristles. Eco-friendly, completely plastic-free oral
              hygiene layout engineered by dental surgeons.
            </p>

            {/* Pricing Tag Component */}
            <div
              style={{
                background: "linear-gradient(145deg, #fff5f5, #ffffff)",
                border: "1.5px solid #fecaca",
                borderRadius: "14px",
                padding: "12px 20px",
                width: "100%",
                maxWidth: "400px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <span
                  style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8" }}
                >
                  LAUNCH PRICE
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#dc2626",
                    }}
                  >
                    ₹44
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹99
                  </span>
                </div>
              </div>
              <span
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Save 55%
              </span>
            </div>

            <button
              style={{
                background: "linear-gradient(135deg, #059669, #10b981)",
                color: "white",
                padding: "14px 44px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                width: "100%",
                maxWidth: "400px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(16,185,129,0.15)",
              }}
            >
              Buy Now (Launch Discount)
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================================= */}
      {/* SECTION 4: WHY BAMBOO?                                                            */}
      {/* ================================================================================= */}
      <section
        ref={whyRef}
        style={{
          width: "100%",
          padding:
            "20px max(15px, calc((100% - 1200px) / 2)) 60px max(15px, calc((100% - 1200px) / 2))",
          background: "linear-gradient(180deg, #ffffff 0%, #f4faf7 100%)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div className="divider" style={{ margin: "0 auto 12px" }} />
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 34px)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Why Switch to{" "}
            <span
              className="serif"
              style={{ fontStyle: "italic", color: "#059669", fontWeight: 700 }}
            >
              Bamboo?
            </span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            width: "100%",
          }}
        >
          {[
            {
              t: "Natural Bamboo",
              d: "Organic clinical-grade solid antibacterial bamboo core platform layer.",
              e: "🎋",
            },
            {
              t: "Eco Friendly",
              d: "Substantially coordinates drop reductions across global plastic waste dumps.",
              e: "🌱",
            },
            {
              t: "Plastic Free",
              d: "Constructed completely void of petrochemical toxins or trace BPA chemical agents.",
              e: "❌",
            },
            {
              t: "Charcoal Bristles",
              d: "Naturally structures stain target extraction while managing volatile mouth odors.",
              e: "🪨",
            },
            {
              t: "Ultra Soft",
              d: "Micro-split structural fiber configurations meticulously safeguard sensitive gums.",
              e: "🪶",
            },
            {
              t: "Sustainable Choice",
              d: "100% conscious cyclical rapid forestry cropping architecture lifecycle.",
              e: "🌍💚",
            },
            {
              t: "Biodegradable Handle",
              d: "Naturally biodegradable bamboo handle that helps reduce plastic waste and supports a cleaner environment.",
              e: "♻️",
            },
            {
              t: "Better for You, Better for Earth",
              d: "A sustainable toothbrush designed for healthier oral care while protecting our planet for future generations.",
              e: "♻️🌍",
            },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: "#ffffff",
                border: "1px solid #e5f0eb",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  background: "#f0fdf4",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  border: "1px solid #d1fae5",
                }}
              >
                {item.e}
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "6px",
                }}
              >
                {item.t}
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "#64748b",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTOR SECTION */}
      <section
        ref={docRef}
        style={{
          padding: "clamp(60px, 10vw, 100px) 20px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: 40,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* 🔥 LEFT: IMAGE */}
          <div style={{ flex: "0 0 280px", textAlign: "center" }}>
            <img
              src="/dr-img-abdHind.jpeg"
              alt="Dr. Ekhlaq Ahmed"
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #e5e7eb",
              }}
            />

            <div style={{ marginTop: 12 }}>
              <span
                style={{
                  background: "linear-gradient(135deg,#d32f2f,#1976d2)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 30,
                }}
              >
                10+ Years Experience
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            {/* Name */}
            <h2
              style={{
                fontSize: "clamp(26px, 5vw, 36px)",
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Dr. Ekhlaq Ahmed
            </h2>

            {/* Roles */}
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#1976d2",
                margin: 0,
              }}
            >
              Founder & Director | Lead Dental Surgeon
            </p>

            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              <span style={{ color: "#38bdf8" }}>Abd Hind </span>
              <span style={{ color: "#4ade80" }}>MediCare</span>
              <span style={{ color: "#9ca3af" }}> Group Pvt. Ltd.</span>
            </p>

            <p
              style={{
                fontSize: "14px",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#d32f2f" }}>MR </span>
              {/* <span style={{ color: "#22c55e" }}>Regenerative </span> */}
              <span style={{ color: "#38bdf8" }}>Dental Clinic</span>
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>
                {" "}
                • Est. 2017
              </span>
            </p>

            {/* Rating */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "0.5px solid #e5e7eb",
                borderRadius: 12,
                padding: "2px 5px",
                // marginTop: 5,
                // marginBottom: 1,
                // boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google"
                style={{ width: 24, height: 24 }}
              />

              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Google Reviews
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#f59e0b",
                  }}
                >
                  ★★★★★ 5.0
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Excellent | Based on Reviews
                </div>
              </div>
            </div>

            {/* ABOUT */}
            <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7 }}>
              Dr. Ekhlaq Ahmed is a highly experienced dental professional with
              over 10 years of expertise in modern and regenerative dentistry. A
              graduate from Jamia Millia Islamia, he has worked across leading
              hospitals and clinics, mastering both advanced and aesthetic
              dental procedures.
            </p>

            {/* <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7 }}>
              His approach is rooted in regenerative dentistry—focused on
              preserving natural teeth, promoting healing, and delivering
              long-term oral health through modern technology and
              patient-centered care.
            </p> */}

            {/* CERTIFICATIONS */}
            {/* <div style={{ marginTop: 12 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e3a8a",
                  marginBottom: 6,
                }}
              >
                Certified By
              </p>

              <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
                dti – Dental Tribune International (USA)
              </p>
              <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
                ICDE – International Centre of Dental Excellence
              </p>
            </div> */}

            {/* AMR */}
            {/* <p style={{ fontSize: "14px", color: "#4b5563", marginTop: 10 }}>
              Active contributor to{" "}
              <span style={{ color: "#1976d2", fontWeight: 600 }}>Cipla</span>'s
              AMR Awareness Program in collaboration with{" "}
              <span style={{ color: "#d32f2f", fontWeight: 700 }}>
                The Times of India
              </span>
              .
            </p> */}

            {/* GRID */}
            {/* <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
                marginTop: 14,
              }}
            >
              {[
                "Regenerative Dentistry",
                "Advanced Treatments",
                "Cosmetic Dentistry",
                "Digital Dentistry",
                "Smile Makeover",
                "Preventive Care",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: "13px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {item}
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section
        ref={trustRef as React.RefObject<HTMLElement>}
        // style={{
        //   padding: "clamp(48px, 8vw, 80px) 20px",
        //   background: "#f7f9f8",
        // }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* 🔥 TOP IMAGE */}

          {/* 🔥 HEADING */}
          <div
            style={{ textAlign: "center", marginBottom: 52 }}
            className={trustIn ? "anim" : ""}
          >
            <div className="divider" style={{ margin: "0 auto 16px" }} />
            <h2
              style={{
                fontSize: "clamp(28px, 6vw, 34px)",
                fontWeight: 800,
                margin: "0 0 10px",
              }}
            >
              Why Patients{" "}
              <span
                className="serif"
                style={{
                  fontStyle: "italic",
                  color: "#059669",
                  fontWeight: 700,
                }}
              >
                Trust
              </span>{" "}
              Us
            </h2>
          </div>
          <div
            style={{
              marginBottom: 40,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src="/ypocr.png"
              alt="Healthcare Vision"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          {/* 🔥 CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: Star,
                title: "5.0★ Rated by Patients",
                desc: "Highly rated for quality treatment, patient satisfaction, and trusted care.",
                accent: "#f59e0b",
                bg: "#fffbeb",
              },
              {
                icon: Award,
                title: "Expert-Led Care",
                desc: "Treatments guided by experienced doctors ensuring safe and effective outcomes.",
                accent: "#059669",
                bg: "#f0fdf4",
              },
              {
                icon: ShieldCheck,
                title: "Strict Safety & Hygiene",
                desc: "Advanced sterilization and safety protocols followed at every step.",
                accent: "#0ea5e9",
                bg: "#f0f9ff",
              },
              {
                icon: Shield,
                title: "Complete Transparency",
                desc: "Clear communication, honest advice, and no hidden costs.",
                accent: "#2563eb",
                bg: "#eff6ff",
              },
              {
                icon: Zap,
                title: "Advanced Technology",
                desc: "Modern equipment ensures precision, comfort, and faster recovery.",
                accent: "#7c3aed",
                bg: "#faf5ff",
              },
              {
                icon: Heart,
                title: "Patient-First Care",
                desc: "Personalized treatments focused on comfort and long-term health.",
                accent: "#ef4444",
                bg: "#fef2f2",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="anim card-lift"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  background: "white",
                  border:
                    i === 0 ? "1.5px solid #facc15" : "1.5px solid #e5f0eb",
                  borderRadius: 20,
                  padding: "clamp(20px, 4vw, 28px)",
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow:
                    i === 0 ? "0 10px 30px rgba(245,158,11,0.25)" : undefined,
                }}
              >
                <div
                  style={{
                    width: "clamp(48px, 9vw, 54px)",
                    height: "clamp(48px, 9vw, 54px)",
                    background: t.bg,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                  }}
                >
                  <t.icon
                    style={{
                      width: "clamp(20px, 4.5vw, 24px)",
                      height: "clamp(20px, 4.5vw, 24px)",
                      color: t.accent,
                    }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: "clamp(14px, 3.5vw, 15px)",
                    fontWeight: 700,
                    margin: "0 0 8px",
                  }}
                >
                  {t.title}
                </h3>

                <p
                  style={{
                    fontSize: "clamp(12px, 2.8vw, 13px)",
                    color: "#6b7280",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
