export const site = {
  name: "Feed My Brain",
  short: "FMB",
  slogan: "Empowering Tomorrow's Tech Trailblazers Today",
  description:
    "Live, project-first courses in Agentic AI, Machine Learning & Deep Learning, and Data Science for college students. Ship a real project every week.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "feedmybrain211@gmail.com",
  whatsapp: "919092730955",
  whatsappDisplay: "+91 90927 30955",
};

export function whatsappLink(text = "Hi Feed My Brain! I'd like to know more about your courses.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const mentors = [
  {
    name: "Darshan",
    role: "Lead Mentor",
    bio: "Software engineer specialized in AI. Has trained 500+ college students in the AI domain.",
    tags: ["Agentic AI", "Machine Learning", "Deep Learning", "Data Science"],
  },
];

export const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Batches & pricing" },
  { href: "/mentors", label: "Mentors" },
  { href: "/colleges", label: "For colleges" },
  { href: "/blog", label: "Blog" },
];

export const footerNav = [
  {
    title: "Courses",
    links: [
      { href: "/courses/agentic-ai", label: "Agentic AI Development" },
      { href: "/courses/ml-dl-transformers", label: "ML, Deep Learning & Transformers" },
      { href: "/courses/data-science", label: "Data Science" },
      { href: "/compare", label: "Compare & course quiz" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/showcase", label: "Student showcase" },
      { href: "/mentors", label: "Mentors" },
      { href: "/pricing", label: "Batches & pricing" },
      { href: "/colleges", label: "For colleges" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Student login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/refund", label: "Refund policy" },
    ],
  },
];

export const faqs = [
  {
    q: "Do I need to know programming before joining?",
    a: "No. All three courses start from your first Python script. Basic computer literacy and logical thinking are enough, and Class 12 maths is all you need for the ML and Data Science courses.",
  },
  {
    q: "Who can join?",
    a: "Undergraduate students from any branch: CSE, IT, ECE, EEE, Mechanical, Science and more. The courses are designed for college students starting from zero.",
  },
  {
    q: "How are classes run?",
    a: "Each week has two 90-minute live sessions (concepts + live coding) and one 3-hour hands-on lab, plus 3-4 hours of self-study. Every week ends with a project you push to GitHub.",
  },
  {
    q: "What laptop do I need?",
    a: "Any laptop with 8 GB RAM works. Heavier work (like training deep learning models) runs on free Google Colab or Kaggle notebooks, so you don't need a GPU.",
  },
  {
    q: "How long are the courses?",
    a: "Agentic AI Development is 16 weeks (4 months). ML, Deep Learning & Transformers and Data Science are 20 weeks (5 months) each. Plan for about 6 contact hours a week.",
  },
  {
    q: "How are projects graded?",
    a: "You submit each project's GitHub link from your student dashboard. Mentors review your work and your marks appear on your dashboard. Phase projects and a team capstone carry more weight.",
  },
  {
    q: "What will I have at the end of the course?",
    a: "A portfolio of 15-19 real projects on GitHub plus a deployed team capstone with a demo video, presented live at demo day.",
  },
  {
    q: "What is the refund policy?",
    a: "Refunds are possible only for genuine emergencies, requested after payment and before your first class. Once the course has started, fees are non-refundable. See the full refund policy for details.",
  },
  {
    q: "How do I enroll?",
    a: "Send us an enquiry or message us on WhatsApp. We'll confirm your batch, share payment details, and create your student login once payment is received.",
  },
];
