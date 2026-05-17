export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  tags: string[];
  sections: {
    heading: string;
    body: string;
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "What is Regenerative Dentistry? Saving Your Natural Teeth",
    excerpt:
      "Discover how regenerative dentistry techniques can save natural teeth and support healing without unnecessary extraction.",
    category: "Smile Makeover",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "April 15, 2026",
    readTime: "6 min read",
    tags: ["Regenerative Dentistry", "Save Teeth", "Natural Healing"],
    sections: [
      {
        heading: "A Tooth-First Approach",
        body:
          "Regenerative dentistry focuses on preserving natural tooth structure whenever clinically possible. At Abd Hind Medicare Group, the care plan begins with diagnosis, infection control, and tissue-friendly treatment options before extraction is considered.",
      },
      {
        heading: "When It Helps",
        body:
          "Patients with deep decay, dental trauma, gum concerns, or early pulp involvement may benefit from modern materials, magnification-led care, and careful follow-up. The aim is to restore comfort, function, and long-term oral health.",
      },
      {
        heading: "What Patients Can Expect",
        body:
          "Your dentist will review X-rays, explain the prognosis, and recommend a personalized treatment sequence. Regular reviews and excellent home care remain essential to protect the saved tooth.",
      },
    ],
  },
  {
    id: "2",
    title: "Painless Root Canal Treatment: Myths vs. Facts",
    excerpt:
      "Modern RCT is comfortable and predictable. Learn what really happens during root canal treatment.",
    category: "Root Canal (RCT)",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "April 10, 2026",
    readTime: "5 min read",
    tags: ["Root Canal", "Painless Dentistry", "RCT"],
    sections: [
      {
        heading: "Modern RCT Is Designed for Comfort",
        body:
          "Root canal treatment removes infection from inside the tooth and seals it to prevent reinfection. With local anesthesia and contemporary instruments, most patients describe the appointment as similar to a routine filling.",
      },
      {
        heading: "Why Delaying Treatment Hurts More",
        body:
          "Untreated infection can spread, increase swelling, and make the tooth harder to save. Early care improves comfort and helps preserve natural biting function.",
      },
      {
        heading: "Aftercare Matters",
        body:
          "A crown or definitive restoration is often recommended after RCT to protect the tooth from fracture. Your clinician will guide diet, hygiene, and follow-up visits.",
      },
    ],
  },
  {
    id: "3",
    title: "Zirconia Crowns vs. Traditional Crowns: Which is Better?",
    excerpt:
      "A practical comparison of zirconia crowns and traditional options for strength, aesthetics, and everyday comfort.",
    category: "Smile Makeover",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "April 5, 2026",
    readTime: "7 min read",
    tags: ["Zirconia Crown", "Cosmetic Dentistry", "Smile Design"],
    sections: [
      {
        heading: "Strength and Appearance",
        body:
          "Zirconia crowns are known for high strength and natural-looking shades, making them suitable for many front and back tooth restorations. Traditional metal-ceramic crowns remain useful in selected clinical situations.",
      },
      {
        heading: "Choosing the Right Crown",
        body:
          "The best crown depends on bite pressure, tooth position, gum health, budget, and aesthetic goals. A digital shade assessment and bite evaluation help the dentist recommend the most reliable option.",
      },
      {
        heading: "Long-Term Care",
        body:
          "Crowns need the same daily brushing, flossing, and professional reviews as natural teeth. Healthy gums and stable bite forces improve restoration longevity.",
      },
    ],
  },
  {
    id: "4",
    title: "Dental Implants: A Permanent Solution for Missing Teeth",
    excerpt:
      "Learn why dental implants are considered a strong, fixed option for replacing missing teeth.",
    category: "Dental Implants",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "March 28, 2026",
    readTime: "8 min read",
    tags: ["Dental Implants", "Tooth Replacement", "Oral Surgery"],
    sections: [
      {
        heading: "How Implants Work",
        body:
          "A dental implant is placed in the jawbone to act as an artificial tooth root. After healing, a crown or bridge is attached to restore chewing function and smile confidence.",
      },
      {
        heading: "Planning Is Essential",
        body:
          "Implant success depends on bone volume, gum health, medical history, and bite balance. Abd Hind Medicare Group uses careful diagnostics to plan safe, predictable treatment.",
      },
      {
        heading: "Maintenance",
        body:
          "Implants are not prone to decay, but the surrounding gums need daily cleaning and periodic professional maintenance to prevent inflammation.",
      },
    ],
  },
  {
    id: "5",
    title: "Child's First Dental Visit: Age, Preparation, and What to Expect",
    excerpt:
      "A parent-friendly guide to making the first dental visit calm, positive, and useful.",
    category: "Pediatric Dentistry",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "March 20, 2026",
    readTime: "5 min read",
    tags: ["Pediatric Dentistry", "Child Dental Care", "Parenting Tips"],
    sections: [
      {
        heading: "Start Early",
        body:
          "A first dental visit is recommended when the first tooth appears or by the first birthday. Early visits help parents understand brushing, diet, fluoride, and cavity prevention.",
      },
      {
        heading: "Keep It Positive",
        body:
          "Use simple, friendly language before the appointment. Avoid words that may create fear, and let the dental team introduce the child to the chair and instruments gently.",
      },
      {
        heading: "What the Dentist Checks",
        body:
          "The visit usually includes a quick oral exam, habit review, brushing guidance, and preventive advice tailored to the child's age.",
      },
    ],
  },
  {
    id: "6",
    title: "Gum Disease: Early Signs You Should Never Ignore",
    excerpt:
      "Bleeding gums and persistent bad breath can be early warning signs. Learn when to seek care.",
    category: "Gum Treatment",
    author: "Dr. Ekhlaq Ahmed",
    authorRole: "Founder & Lead Dental Surgeon",
    date: "March 15, 2026",
    readTime: "6 min read",
    tags: ["Gum Health", "Periodontics", "Prevention"],
    sections: [
      {
        heading: "Common Warning Signs",
        body:
          "Bleeding while brushing, swollen gums, bad breath, loose teeth, or gum recession should be checked early. Gum disease is easier to control before it damages the supporting bone.",
      },
      {
        heading: "Why Gum Health Affects Overall Health",
        body:
          "Inflammation in the gums may be associated with diabetes control, heart health, and pregnancy outcomes. Professional cleaning and home care reduce bacterial load.",
      },
      {
        heading: "Treatment Options",
        body:
          "Treatment can include scaling, root surface cleaning, medication, and maintenance visits. Your dentist will recommend a schedule based on severity.",
      },
    ],
  },
];

export function getBlogPost(id: string) {
  return blogPosts.find((post) => post.id === id);
}

