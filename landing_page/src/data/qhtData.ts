import { COMPANY_NAME } from "@/config/constants";

export interface NavDropdownItem {
  label: string;
  href: string;
  image?: string;
  desc?: string;
}

export interface CelebritySlide {
  name: string;
  location?: string;
  image: string;
}

export interface TruthItem {
  id: number;
  title: string;
  desc: string;
}

export interface PromiseItem {
  id: number;
  title: string;
  desc: string;
}

export interface DifferenceItem {
  title: string;
  icon: string;
  qhtPromise: string;
  otherClinics: string;
}

export interface ExpertStage {
  title: string;
  percentage: string;
  whoWithYou: {
    role: string;
    icon: string;
  }[];
  howTheySupport: string[];
}

export interface PricePackage {
  technique: string;
  fullName: string;
  desc: string;
  perGraft: number;
  totalRange: string;
  isFeatured?: boolean;
  features: string[];
  link: string;
}

export interface ServiceAccordionItem {
  id: number;
  title: string;
  subtitle: string;
  paragraphs: string[];
  image: string;
  link: string;
}

export interface TransformationItem {
  id: number;
  patientName: string;
  grade: string;
  beforeImg: string;
  afterImg: string;
}


export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Branch {
  region: string;
  name: string;
  address: string;
  mapLink: string;
}

// 1. Navigation Data
export const NAV_RESULTS_MENU = {
  baldnessGrades: [
    { label: "Grade 02", href: "/results/?baldness-grade=grade-02" },
    { label: "Grade 2A", href: "/results/?baldness-grade=grade-2a" },
    { label: "Grade 03", href: "/results/?baldness-grade=grade-03" },
    { label: "Grade 04", href: "/results/?baldness-grade=grade-04" },
    { label: "Grade 05", href: "/results/?baldness-grade=grade-05" },
    { label: "Grade 06", href: "/results/?baldness-grade=grade-06" },
    { label: "Grade 07", href: "/results/?baldness-grade=grade-07" },
    { label: "Diffuse Grade 3A", href: "/results/?baldness-grade=diffuse-grade-3a" },
    { label: "Diffuse Grade 4A", href: "/results/?baldness-grade=diffuse-grade-4a" },
    { label: "Diffuse Grade 5A", href: "/results/?baldness-grade=diffuse-grade-5a" },
    { label: "Diffuse Grade 6A", href: "/results/?baldness-grade=diffuse-grade-06" },
  ],
  patientTypes: [
    { label: "Celebrity Results", href: "/results/?patient-type=celebrity" },
    { label: "Indian Patients", href: "/results/?patient-type=normal" },
    { label: "International Patients", href: "/results/?patient-type=international" },
  ],
  graftRanges: [
    { label: "1000–2000 Grafts", href: "/results/?grafts-range=1100-2000" },
    { label: "2100-3000 Grafts", href: "/results/?grafts-range=2100-3000" },
    { label: "3100-4000 Grafts", href: "/results/?grafts-range=3100-4000" },
    { label: "4100-5000 Grafts", href: "/results/?grafts-range=4100-5000" },
    { label: "5100-6000 Grafts", href: "/results/?grafts-range=5100-6000" },
    { label: "6100-7000 Grafts", href: "/results/?grafts-range=6100-7000" },
    { label: "7100-8000 Grafts", href: "/results/?grafts-range=7100-8000" },
    { label: "8000+ Grafts", href: "/results/?grafts-range=8000+" },
  ],
  areasTreated: [
    { label: "Frontal Hairline Results", href: "/results/?area-treated=frontal", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/rm-area-icon-1.png" },
    { label: "Crown Area Results", href: "/results/?area-treated=frontalcrown", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/rm-area-icon-2.png" },
    { label: "Temples & Hairline Reconstruction", href: "/results/?area-treated=frontal-temples", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/rm-area-icon-3.png" },
    { label: "Full Scalp Restorations", href: "/results/?area-treated=frontalmid-scalptemples", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/rm-area-icon-4.png" },
  ],
};

export const NAV_SERVICES_LIST = [
  { label: "Hair Transplant For Men", href: "/services/hair-transplant-for-men/" },
  { label: "Hair Transplant Repair", href: "/services/failed-hair-transplant-repair/" },
  { label: "Bad Hair Transplant Correction", href: "/services/bad-hair-transplant-correction/" },
  { label: "Unshaven Hair Transplant", href: "/services/unshaven-hair-transplant/" },
  { label: "Beard Hair Transplant", href: "/services/beard-hair-transplant-in-india/" },
  { label: "Ultra-Dense Hair Transplant", href: "/services/ultra-dense-hair-transplant/" },
  { label: `${COMPANY_NAME} Hair Transplant`, href: "/services/quick-hair-transplant-in-india/" },
  { label: "FUE Hair Transplant", href: "/services/best-fue-hair-transplant-in-india/" },
  { label: "Moustache Hair Transplant", href: "/services/moustache-hair-transplant-in-india/" },
  { label: "Afro Hair Transplant", href: "/services/afro-hair-transplant-in-india/" },
  { label: "Female Hair Transplant", href: "/services/female-hair-transplantation/" },
  { label: "Burn Hair Transplant", href: "/services/burn-hair-transplant/" },
  { label: "Caucasian Patients Hair Transplant", href: "/services/caucasian-patients-hair-transplant/" },
  { label: "Crown Hair Transplant", href: "/services/crown-hair-transplant/" },
  { label: "Custom Hairline Transplant", href: "/services/custom-hairline-transplant/" },
  { label: "Eyebrow Reconstruction", href: "/services/eyebrow-reconstruction-in-india/" },
  { label: "Hairline Reconstruction", href: "/services/hairline-reconstruction/" },
  { label: "Natural Look Hair Restoration", href: "/services/natural-look-hair-restoration/" },
  { label: "Social Media Influencer Hair", href: "/services/social-media-influencer-hair-transplant/" },
  { label: "Temple Hair Transplant", href: "/services/temple-hair-transplant/" },
  { label: "FUT Hair Transplant", href: "/services/fut-hair-transplant/" },
];

export const NAV_ABOUT_LIST = [
  { label: "Who we are", href: "/about/", image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" },
  { label: "Blog", href: "/blogs/", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
  { label: "Career", href: "/career/", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80" },
  { label: "Medical Tourism", href: "/medical-tourism/", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" },
  { label: "Frequently Asked Questions", href: "/faq/", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80" },
];

// 2. Hero Results Slider Data
export const HERO_SLIDES: CelebritySlide[] = [
  { name: "Patient1", location: "Mumbai, India", image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-6-10-26-pm-mu2k3a2cw7pyto.jpeg" },
  { name: "Patient2", location: "Mumbai, India", image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-6-10-25-pm-mu2k3a8opndxid.jpeg" },
  { name: "Patient3", location: "Delhi, India", image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-15-at-10-22-47-am-mu2k30p99krelc.jpeg" },
  { name: "Patient4", location: "Mumbai, India", image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-15-at-10-22-47-am-mu2k30vb4yns1b.jpeg" },
  { name: "Patient5", location: "Haridwar, India", image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-15-at-10-22-46-am-mu2k310vtu0x5v.jpeg" },
  { name: "Patient6", location: "Rajasthan, India", image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-15-at-10-22-46-am-mu2k316p8jcsrr.jpeg" },
];

// 3. The Bald Truth
export const BALD_TRUTH_ITEMS: TruthItem[] = [
  {
    id: 1,
    title: "Doctor experience is paramount",
    desc: `Surgical artistry and anatomical expertise are the single greatest determinants of natural density and graft survival.`,
  },
  {
    id: 2,
    title: "Donor follicles are finite & irreplaceable",
    desc: "Your donor zone has a limited reserve. Over-harvesting causes irreversible scarring and permanent patchiness.",
  },
  {
    id: 3,
    title: "1 in 10 transplants globally require revision",
    desc: "Substandard graft handling and poor hairline design drive high rates of corrective surgery worldwide.",
  },
  {
    id: 4,
    title: "Hair loss progresses continuously",
    desc: "Balding is progressive; without a strategic long-term restoration plan, thinning behind a transplant creates an uneven look.",
  },
  {
    id: 5,
    title: "Budget clinics carry hidden corrective costs",
    desc: "Low-cost procedures often compromise on doctor involvement, leading to expensive repair surgeries later.",
  },
  {
    id: 6,
    title: "Outdated techniques cause permanent scarring",
    desc: "Coarse punch sizes and improper harvesting tools damage donor vitality and leave harsh, visible marks.",
  },
];

// 4. Our Promises
export const PROMISES_LIST: PromiseItem[] = [
  {
    id: 1,
    title: "Bespoke Hairline Architecture",
    desc: "Every hairline is custom-crafted to complement your facial structure, age, and natural hair exit angles.",
  },
  {
    id: 2,
    title: "Surgeon-Led Medical Standards",
    desc: `Procedures conducted in state-of-the-art sterile surgical suites by certified ${COMPANY_NAME} restoration experts.`,
  },
  {
    id: 3,
    title: `Advanced Micro-Grafting Precision`,
    desc: `Gentle micro-handling and modern implanter technology ensure rapid healing and superior graft viability.`,
  },
  {
    id: 4,
    title: "Permanent, Natural Density",
    desc: "DHT-resistant donor roots ensure your restored hair continues to grow naturally and stays for life.",
  },
  {
    id: 5,
    title: "Transparent, All-Inclusive Pricing",
    desc: "Clear packages, honest graft estimates, and zero hidden billing surprises — guaranteed always.",
  },
];

export const PROMISE_GALLERY_IMAGES = [
  "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/clinic-with-doc-mtzjmlrtcqfokt.jpeg",
  "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/p5-mtzj1k7g8yzzb9.jpeg",
  "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/t1-mtzji2lq10j280.jpeg",
  "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/clinic-with-doc-mtzjmlrtcqfokt.jpeg",
  "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-15-at-10-22-45-am-mu2k31is4e8c0u.jpeg",
  "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-15-at-10-22-47-am-mu2k30vb4yns1b.jpeg",
];

// 5. See the Difference
export const DIFFERENCE_ITEMS: DifferenceItem[] = [
  {
    title: "Natural Hairline",
    icon: "https://www.qhtclinic.com/wp-content/uploads/2025/11/Vector.png",
    qhtPromise: "Handcrafted single-hair feathering that replicates the organic, soft transition of a natural hairline.",
    otherClinics: "Standardized straight templates that often result in an artificial, pluggy appearance.",
  },
  {
    title: "Safe Procedure",
    icon: "https://www.qhtclinic.com/wp-content/uploads/2025/11/2005565196496.png",
    qhtPromise: "Performed in hospital-grade surgical theaters adhering to strict international clinical safety standards.",
    otherClinics: "Informal, unmonitored room setups where procedural hygiene is often compromised.",
  },
  {
    title: "Advanced Technique",
    icon: "https://www.qhtclinic.com/wp-content/uploads/2025/11/2005565196496.png",
    qhtPromise: "Ultra-refined micro-extraction and direct implantation tools that minimize scalp trauma and leave no linear scars.",
    otherClinics: "Larger manual punches and older techniques that cause visible scarring and prolong recovery.",
  },
  {
    title: "Life-Long Results",
    icon: "https://www.qhtclinic.com/wp-content/uploads/2025/11/2004932934464.png",
    qhtPromise: "High follicle viability rate delivering dense, natural coverage that thrives permanently.",
    otherClinics: "Higher follicle transection rates resulting in low density and short-lived, uneven growth.",
  },
  {
    title: "Transparent Pricing",
    icon: "https://www.qhtclinic.com/wp-content/uploads/2025/11/Vector-2.png",
    qhtPromise: "Upfront per-graft pricing and itemized plans with zero surprise charges on surgery day.",
    otherClinics: "Low initial quotes with surprise add-on fees introduced throughout the treatment.",
  },
];

// 6. Experts Journey
export const EXPERT_STAGES: ExpertStage[] = [
  {
    title: "Consultation",
    percentage: "0%",
    whoWithYou: [
      { role: "Hair Restoration Specialist", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/hp-expert-icon-1.webp" },
      { role: "Clinical Dermatologist", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/derma-icon.webp" },
      { role: "Patient Care Advisor", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/coordinator-icon.webp" },
    ],
    howTheySupport: [
      "Comprehensive scalp & trichoscopic assessment",
      "Custom hairline design tailored to your face",
      "Transparent graft requirement & cost roadmap",
    ],
  },
  {
    title: "Pre-Op",
    percentage: "30%",
    whoWithYou: [
      { role: "Lead Hair Restoration Surgeon", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/hp-expert-icon-1.webp" },
      { role: "Anesthetist", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/anesthetist-icon.webp" },
      { role: "Certified Surgical Technicians", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/technicians-icon.webp" },
    ],
    howTheySupport: [
      "Precision donor mapping & graft distribution plan",
      "Comfort-focused painless local anesthesia protocol",
      "Strict sterile theater preparation and safety checks",
    ],
  },
  {
    title: "Surgery",
    percentage: "60%",
    whoWithYou: [
      { role: "Lead Hair Restoration Surgeon", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/hp-expert-icon-1.webp" },
      { role: "Micro-Graft Technicians", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/anesthetist-icon.webp" },
    ],
    howTheySupport: [
      "Gentle, non-traumatic follicular unit extraction",
      "Microscopic graft sorting and quality inspection",
      "Depth, angle, and direction-controlled direct implantation",
    ],
  },
  {
    title: "Recovery",
    percentage: "100%",
    whoWithYou: [
      { role: "Restoration Specialist", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/hp-expert-icon-1.webp" },
      { role: "Dermatology Team", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/derma-icon.webp" },
      { role: "Post-Op Care Coordinator", icon: "https://www.qhtclinic.com/wp-content/uploads/2025/10/care-team.webp" },
    ],
    howTheySupport: [
      "Structured first-wash protocol and healing guidance",
      "Personalized scalp maintenance and growth therapy plan",
      "Scheduled 3, 6, 9 & 12-month progress evaluations",
    ],
  },
];

// 7. Pricing by Technique
export const PRICING_PACKAGES: PricePackage[] = [
  {
    technique: "FUE",
    fullName: "Follicular Unit Extraction",
    desc: "5000 – 6000 Grafts Required. Minimally invasive extraction delivering natural, permanent hairline restoration.",
    perGraft: 10,
    totalRange: "₹50,000 – ₹60,000 (5k–6k Grafts)",
    features: [
      "4 PRP Free",
      "5 Days Med Free",
      "Bandage Removal Free",
      "Headwash Free",
      "Blood Test Free",
      "Post Transplant Doctor Consultation Free",
    ],
    link: "/services/best-fue-hair-transplant-in-india/",
  },
  {
    technique: "BIO FUE",
    fullName: "Bio-Enhanced FUE",
    desc: "5000 – 6000 Grafts Required. Includes DMEM Medium preservation for boosted follicle survival and faster healing.",
    perGraft: 15,
    totalRange: "₹75,000 – ₹90,000 (5k–6k Grafts)",
    features: [
      "5 GFC Free",
      "Includes DMEM Medium",
      "5 Days Med Free",
      "Bandage Removal Free",
      "Headwash Free",
      "Blood Test Free",
      "Post Transplant Doctor Consultation Free",
    ],
    link: "/services/best-fue-hair-transplant-in-india/",
  },
  {
    technique: "DHI",
    fullName: "Direct Hair Implantation",
    desc: "5000 – 6000 Grafts Required. High-precision direct implanter pen technique for maximum density and natural angle control.",
    perGraft: 15,
    totalRange: "₹75,000 – ₹90,000 (5k–6k Grafts)",
    features: [
      "3 GFC Free",
      "5 Days Med Free",
      "Bandage Removal Free",
      "Headwash Free",
      "Blood Test Free",
      "Post Transplant Doctor Consultation Free",
    ],
    link: "/services/quick-hair-transplant-in-india/",
  },
  {
    technique: "PREMIUM DHI",
    fullName: "Sapphire Blade & DHI Pen",
    desc: "5000 – 6000 Grafts Required. Sapphire Blade precision, DHI Pen direct implantation & DMEM Medium preservation.",
    perGraft: 25,
    totalRange: "₹1,25,000 – ₹1,50,000 (5k–6k Grafts)",
    isFeatured: true,
    features: [
      "6 GFC Free",
      "Sapphire Blade & DHI Pen",
      "Includes DMEM Medium",
      "5 Days Med Free",
      "Bandage Removal Free",
      "Headwash Free",
      "Blood Test Free",
      "Post Transplant Doctor Consultation Free",
    ],
    link: "/services/quick-hair-transplant-in-india/",
  },
];

// 8. Services Accordion
export const SERVICES_ACCORDION: ServiceAccordionItem[] = [
  {
    id: 1,
    title: "Hair Restoration for Men",
    subtitle: "Clinically proven surgical restoration for male pattern baldness and receding temples.",
    paragraphs: [
      "Male pattern hair loss (Androgenetic Alopecia) progressively affects hairline position and crown density.",
      `At ${COMPANY_NAME}, our male restoration procedures combine aesthetic hairline design with permanent follicle longevity, restoring your natural look and personal confidence.`,
    ],
    image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/t1-mtzji2lq10j280.jpeg",
    link: "/services/hair-transplant-for-men/",
  },
  {
    id: 2,
    title: "Artistic Hairline Reconstruction",
    subtitle: "Restoring natural facial harmony with age-appropriate, soft-edged hairline design.",
    paragraphs: [
      "A well-designed hairline frames the face and restores youthful facial balance without looking artificial.",
      `At ${COMPANY_NAME}, our surgeons handcraft every hairline contour, selecting single-hair follicles at precise growth angles to achieve undetectable, permanent results.`,
    ],
    image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-13-at-12-09-12-am-mtzjsehbjkjquk.jpeg",
    link: "/services/hairline-reconstruction/",
  },
  {
    id: 3,
    title: "Corrective & Revision Surgery",
    subtitle: "Repairing unnatural hairlines, visible donor scarring, and poor graft density from prior clinics.",
    paragraphs: [
      "If a previous hair transplant left you with pluggy grafts, misdirected hair, or depleted donor areas, corrective restoration can restore balance.",
      `Our experienced surgical team at ${COMPANY_NAME} carefully redistributes grafts, camouflages scars, and refines your hairline to deliver the natural appearance you originally envisioned.`,
    ],
    image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/iii2-mtzjkctwkp1zrc.jpeg",
    link: "/services/failed-hair-transplant-repair/",
  },
  {
    id: 4,
    title: "GFC (Growth Factor Concentrate) Therapy",
    subtitle: "Next-generation autologous growth factor treatment to revitalize thinning follicles.",
    paragraphs: [
      "Growth Factor Concentrate (GFC) therapy harnesses concentrated regenerative growth factors from your own blood, delivered directly to weakened hair roots.",
      "This non-surgical therapy is highly effective for reducing active shedding, strengthening existing hair caliber, and boosting overall scalp vitality.",
    ],
    image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/clinic-with-doc-mtzjmlrtcqfokt.jpeg",
    link: "/services/gfc-treatment/",
  },
  {
    id: 5,
    title: "Beard & Facial Hair Restoration",
    subtitle: "Sculpting dense, well-defined beard, mustache, and sideburn contours permanently.",
    paragraphs: [
      "Facial hair restoration implants individual donor follicles into sparse, patchy, or scarred areas across the beard and mustache.",
      `Using ${COMPANY_NAME} micro-precision techniques, facial grafts are placed along the exact natural direction of facial hair growth for seamless blending and effortless styling.`,
    ],
    image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/screenshot-2026-09-13-135730-mtzjxcb7vl9gg7.png",
    link: "/services/beard-hair-transplant-in-india/",
  },
  {
    id: 6,
    title: "PRP Cellular Scalp Therapy",
    subtitle: "Targeted platelet-rich plasma injections to stimulate natural follicle activity and scalp health.",
    paragraphs: [
      "Platelet-Rich Plasma (PRP) is a clinically proven, non-invasive treatment utilizing your body’s own healing platelets to nourish dormant follicles.",
      "Ideal for early-stage thinning, post-transplant recovery acceleration, and overall hair density maintenance.",
    ],
    image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/mask-group-4-mtzjz39sekfjz5.webp",
    link: "/services/prp-treatment/",
  },
];

// 9. Transformation Gallery
export const TRANSFORMATION_GALLERY: TransformationItem[] = [
  {
    id: 1,
    patientName: "Patient - 1",
    grade: "Uttar Pradesh · Grade 5A",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-mtzm9qege4m658.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/firefly-removebackground-mtzm64rwl6pkss.png",
  },
  {
    id: 2,
    patientName: "Patient - 2",
    grade: "Jabalpur · Grade 4",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-1-mtzmbn4vqwbdn3.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-2-mtzv0lk8j638b7.png",
  },
  {
    id: 3,
    patientName: "Patient - 3",
    grade: "Grade 6",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-6-mtzmmfyjtmpxyz.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-4-mtzmgy4ufm739v.png",
  },
  {
    id: 4,
    patientName: "Patient - 4",
    grade: "Bangalore · DHI",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-5-mtzurmt0h3tm7w.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/chatgpt-image-sep-13-2026-02-25-44-pm-mtzuuboggumj3g.png",
  },

];

// 11. FAQ Items
export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "01",
    question: `How does ${COMPANY_NAME} ensure natural, undetectable hair transplant results?`,
    answer: `At ${COMPANY_NAME}, our surgeons handcraft every hairline considering your facial bone structure, age, and natural hair exit angles. We selectively implant single-hair follicles along the front perimeter with gradual micro-irregularities to replicate organic hair growth.`,
  },
  {
    id: "02",
    question: "Is a hair transplant procedure truly permanent?",
    answer: "Yes. Transplanted follicles are harvested from the DHT-resistant safe donor zone at the back and sides of your scalp. These roots maintain their genetic resistance to balding hormones and continue to grow naturally for life.",
  },
  {
    id: "03",
    question: `What makes ${COMPANY_NAME} techniques different from standard clinics?`,
    answer: `Unlike commercial setups where non-medical staff perform surgeries, ${COMPANY_NAME} procedures are surgeon-led in sterile surgical theaters. Our micro-extraction and direct implanter pen methods minimize out-of-body graft time, ensuring 95%+ follicle viability.`,
  },
  {
    id: "04",
    question: "Can an unnatural or failed previous transplant be corrected?",
    answer: `Yes. We frequently perform corrective and revision surgeries to fix pluggy hairlines, unnatural angles, and donor scarring from previous low-cost procedures through meticulous follicle redistribution and scar camouflage.`,
  },
  {
    id: "05",
    question: "What is the recovery and growth timeline?",
    answer: "Most patients return to routine activities within 5 to 7 days. Micro-crusts shed by day 10. Transplanted hair begins steady new growth by month 3–4, with full natural density visible between 9 to 12 months.",
  },
];

// 12. Clinic Branches & Cities
export const CLINIC_BRANCHES: Branch[] = [
  {
    region: "Main Clinic Branch - Patna",
    name: `${COMPANY_NAME} Patna`,
    address: "Vishal Residency Wing-1, Pillar No-56, Raja Bazar, Patna, Bihar 800014",
    mapLink: "https://www.google.com/maps/place/NEXGEN+HAIR+TRANSPLANT/@25.6044229,85.0827564,17z",
  },
  {
    region: "Second Clinic Branch - Mumbai",
    name: `${COMPANY_NAME} Mumbai`,
    address: "Bandra West / Andheri, Mumbai, Maharashtra",
    mapLink: "https://maps.google.com/?q=Mumbai+Maharashtra",
  },
];

export const CITY_PAGES = [
  "Delhi", "Ahmedabad", "Bangalore", "Chandigarh", "Chennai", "Dehradun",
  "Ghaziabad", "Gurgaon", "Guwahati", "Haridwar", "Hyderabad", "Indore",
  "Jaipur", "Kochi", "Kolkata", "Lucknow", "Mumbai", "Nagpur",
  "Noida", "Patna", "Pune", "Surat",
];

export const COUNTRY_CODES = [
  { code: "+91", label: "+91 🇮🇳", country: "India" },
  { code: "+1", label: "+1 🇺🇸", country: "USA/Canada" },
  { code: "+44", label: "+44 🇬🇧", country: "UK" },
  { code: "+971", label: "+971 🇦🇪", country: "UAE" },
  { code: "+61", label: "+61 🇦🇺", country: "Australia" },
  { code: "+65", label: "+65 🇸🇬", country: "Singapore" },
  { code: "+49", label: "+49 🇩🇪", country: "Germany" },
  { code: "+33", label: "+33 🇫🇷", country: "France" },
  { code: "+7", label: "+7 🇷🇺", country: "Russia" },
  { code: "+966", label: "+966 🇸🇦", country: "Saudi Arabia" },
];
