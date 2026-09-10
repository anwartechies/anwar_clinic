const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:5050";

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatar: string | null;
  coverImage: string | null;
  readTime: string;
  publishedAt: string;
  featured: boolean;
}

export interface BlogDetail extends BlogCard {
  content: string;
  contentBlocks?: any[];
  faqs: BlogFaq[];
  metaTitle: string | null;
  metaDescription: string | null;
  views?: number;
  related?: BlogCard[];
}

// Fallback articles in case backend is offline during static build
export const FALLBACK_BLOGS: BlogDetail[] = [
  {
    id: "f1",
    slug: "fue-vs-fut-hair-transplant-comparison",
    title: "FUE vs FUT Hair Transplant: Which Technique Is Best for You?",
    excerpt:
      "A comprehensive clinical comparison between Follicular Unit Extraction (FUE) and Follicular Unit Transplantation (FUT), helping you make an informed decision for permanent hair restoration.",
    category: "Hair Transplant",
    tags: ["FUE", "FUT", "Hair Restoration", "Surgical Comparison"],
    authorName: "Dr. Anwar",
    authorRole: "Lead Surgeon & Hair Restoration Specialist",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80",
    readTime: "6 min read",
    publishedAt: new Date().toISOString(),
    featured: true,
    metaTitle: "FUE vs FUT Hair Transplant: Complete Doctor Comparison Guide",
    metaDescription: "Understand the key differences between FUE and FUT hair transplant techniques. Learn about scarring, recovery time, graft yield, and suitability with Anwar Clinic.",
    content: `
<h2>Understanding the Two Primary Hair Transplant Techniques</h2>
<p>When considering surgical hair restoration, the choice between <strong>Follicular Unit Extraction (FUE)</strong> and <strong>Follicular Unit Transplantation (FUT)</strong> is one of the most critical decisions a patient faces. Both methods transfer healthy, DHT-resistant hair follicles from the donor zone into thinning or balding recipient areas.</p>

<h3>What is Follicular Unit Extraction (FUE)?</h3>
<p>In modern FUE procedures, each follicular unit—containing 1 to 4 hairs—is individually extracted using a specialized micro-punch tool (typically 0.7mm to 0.9mm in diameter). Because individual grafts are extracted one by one, tiny circular punctures heal within days as virtually imperceptible micro-dots.</p>

<h3>What is Follicular Unit Transplantation (FUT / Strip Method)?</h3>
<p>FUT involves surgically removing a narrow strip of scalp tissue from the donor zone. The strip is subsequently dissected into individual follicular units under stereoscopic microscopes. The donor incision is closed using trichophytic closure techniques, leaving a fine linear scar.</p>

<h3>Which Technique Should You Choose?</h3>
<p>The optimal procedure depends on your scalp laxity, donor density, Norwood hair loss stage, and personal hairstyle preferences. During your consultation at Anwar Clinic, digital trichoscopy is performed to measure density and determine the best approach.</p>
`,
    faqs: [
      {
        question: "Is an FUE hair transplant completely scarless?",
        answer: "FUE creates pinpoint circular micro-scars (less than 1mm) that heal naturally and are virtually undetectable to the naked eye.",
      },
      {
        question: "How long does hair transplant recovery take?",
        answer: "Most patients return to desk jobs within 3 to 5 days. Redness subsides within 7 to 10 days, while new growth begins around month 3 to 4.",
      },
    ],
  },
  {
    id: "f2",
    slug: "post-hair-transplant-recovery-week-by-week-guide",
    title: "Post-Hair Transplant Recovery: What to Expect Week by Week",
    excerpt:
      "A complete day-by-day and week-by-week timeline of hair transplant recovery, scab care, shock loss, and the exciting new growth journey.",
    category: "Recovery & Aftercare",
    tags: ["Recovery", "Aftercare", "Healing Timeline", "Hair Care"],
    authorName: "Dr. Anwar",
    authorRole: "Lead Surgeon & Hair Restoration Specialist",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80",
    readTime: "7 min read",
    publishedAt: new Date().toISOString(),
    featured: false,
    metaTitle: "Hair Transplant Recovery Timeline: Week-by-Week Aftercare Guide",
    metaDescription: "Learn what happens after your hair transplant surgery from day 1 to month 12. Expert tips on washing, sleeping, shock loss, and timeline expectations.",
    content: `
<h2>The Journey to Full Hair Restoration</h2>
<p>Undergoing hair restoration is an exciting milestone, but knowing what to anticipate during post-operative recovery ensures both peace of mind and the highest graft survival rate.</p>

<h3>Days 1 to 3: Immediate Post-Op Care</h3>
<p>During the first 72 hours, newly implanted grafts are establishing their blood supply. Keep the recipient area moist using the provided saline mist spray every 2–3 hours.</p>

<h3>Days 4 to 10: Gentle Cleansing & Scab Shedding</h3>
<p>Commence gentle cup washing using clinical baby shampoo. By day 8–10, scabs soften and begin to shed naturally during washing.</p>

<h3>Weeks 2 to 8: Shock Loss Phase</h3>
<p>Transplanted hair shafts shed temporarily (telogen effluvium). This is completely normal: the living follicular roots remain safely anchored and will produce new hair shafts.</p>

<h3>Months 3 to 12: Visible Growth & Final Density</h3>
<p>Fine hairs emerge at month 3-4, thickening significantly between months 6 to 12.</p>
`,
    faqs: [
      {
        question: "When can I wash my hair normally?",
        answer: "You can resume normal shower pressure after 14 days, once the follicular grafts are fully anchored.",
      },
    ],
  },
];

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    console.warn(`[blogs] Could not reach ${API_URL}${path}`);
    return null;
  }
}

export async function fetchBlogs(params?: {
  category?: string;
  search?: string;
}): Promise<BlogCard[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category.toLowerCase() !== "all") {
    query.set("category", params.category);
  }
  if (params?.search) {
    query.set("search", params.search);
  }

  const qs = query.toString() ? `?${query.toString()}` : "";
  const data = await getJson<BlogCard[]>(`/public/blogs${qs}`);
  if (data && data.length > 0) return data;
  return FALLBACK_BLOGS;
}

export async function fetchBlog(slug: string): Promise<BlogDetail | null> {
  const data = await getJson<BlogDetail>(`/public/blogs/${encodeURIComponent(slug)}`);
  if (data) return data;
  const fallback = FALLBACK_BLOGS.find((b) => b.slug === slug);
  return fallback || null;
}
