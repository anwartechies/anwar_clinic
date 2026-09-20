// ─────────────────────────────────────────────────────────────────────────────
// Service section schema — the single source of truth for what is editable on a
// service page. The admin panel fetches this from GET /services/schema and
// renders its forms from it, so adding a field is a change HERE ONLY: no admin
// UI work, no migration (section data lives in a JSONB column).
//
// Each `key` maps to a section component on the landing page. Any field left
// empty falls back to that component's own DEFAULT_* constant, which is why a
// brand-new service renders a complete page before anything is filled in.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "image" | "stringList" | "objectList";

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  /** objectList only — the shape of one row. */
  itemFields?: { name: string; label: string; type: "text" | "textarea" | "image" | "stringList" }[];
}

export interface SectionSchema {
  key: string;
  label: string;
  /** Landing-page component this drives — for traceability, not used at runtime. */
  component: string;
  description: string;
  /** Sections with no fields are presence-only (show/hide toggle). */
  fields: SchemaField[];
}

const ICON_HELP = "Image URL — upload in Media Library and paste the URL";

export const SERVICE_SECTIONS: SectionSchema[] = [
  {
    key: "hero",
    label: "Hero",
    component: "ServiceDetailHero",
    description: "Top banner: headline, supporting line and background image.",
    fields: [
      { name: "title", label: "Headline", type: "text", help: "Defaults to the service title" },
      { name: "subtitle", label: "Sub-headline", type: "textarea" },
      { name: "bannerImage", label: "Banner image", type: "image", help: ICON_HELP },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "pointerLabel", label: "Pointer label", type: "text", placeholder: "Precision treatment" },
    ],
  },
  {
    key: "intro",
    label: "Intro — What is / In India",
    component: "ServiceIntroSection",
    description: "Two alternating text-and-image blocks below the hero.",
    fields: [
      { name: "block1Heading", label: "Block 1 heading", type: "text", help: 'Defaults to "What is {title}?"' },
      { name: "block1Lead", label: "Block 1 lead line", type: "text" },
      { name: "block1Paragraphs", label: "Block 1 paragraphs", type: "stringList" },
      { name: "block1Image", label: "Block 1 image", type: "image", help: ICON_HELP },
      { name: "pointer1", label: "Image pointer 1", type: "text", placeholder: "Punch removal" },
      { name: "pointer2", label: "Image pointer 2", type: "text", placeholder: "Graft correction" },
      { name: "block2Heading", label: "Block 2 heading", type: "text", help: 'Defaults to "{title} in India"' },
      { name: "block2Paragraphs", label: "Block 2 paragraphs", type: "stringList" },
      { name: "block2Image", label: "Block 2 image", type: "image", help: ICON_HELP },
    ],
  },
  {
    key: "results",
    label: "Results — Before / After",
    component: "ServiceResultsSection",
    description: "Before-and-after slider of patient results.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "results",
        label: "Result pairs",
        type: "objectList",
        itemFields: [
          { name: "name", label: "Patient name", type: "text" },
          { name: "beforeImg", label: "Before image", type: "image" },
          { name: "afterImg", label: "After image", type: "image" },
        ],
      },
    ],
  },
  {
    key: "candidate",
    label: "Ideal Candidate",
    component: "ServiceCandidateSection",
    description: "Who this procedure suits.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "points",
        label: "Candidate points",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "types",
    label: "Types of Procedure",
    component: "ServiceTypesSection",
    description: "The techniques available for this service.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "types",
        label: "Procedure types",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
          { name: "image", label: "Image", type: "image" },
          { name: "points", label: "Bullet points", type: "stringList" },
        ],
      },
    ],
  },
  {
    key: "benefits",
    label: "Benefits",
    component: "ServiceBenefitsSection",
    description: "Dark green benefits grid.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "benefits",
        label: "Benefits",
        type: "objectList",
        itemFields: [
          { name: "icon", label: "Icon", type: "image" },
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "procedure",
    label: "Procedure Steps",
    component: "ServiceProcedureSection",
    description: "Numbered walkthrough of the procedure.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "steps",
        label: "Steps",
        type: "objectList",
        itemFields: [
          { name: "stepNumber", label: "Step number", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "preProcedure",
    label: "Pre-Procedure Tips",
    component: "ServicePreProcedureSection",
    description: "What the patient should do beforehand.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "tips",
        label: "Tips",
        type: "objectList",
        itemFields: [
          { name: "icon", label: "Icon", type: "image" },
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "cost",
    label: "Cost in India",
    component: "ServiceCostSection",
    description: "Pricing overview and the factors that drive it.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "costOverview", label: "Overview paragraphs", type: "stringList" },
      {
        name: "tableRows",
        label: "Price table",
        type: "objectList",
        help: "Rows of the pricing table shown above the cost factors.",
        itemFields: [
          { name: "type", label: "Procedure / graft range", type: "textarea" },
          { name: "cost", label: "Price range", type: "text" },
          { name: "badge", label: "Badge", type: "text" },
        ],
      },
      { name: "factorsSubtitle", label: "Factors sub-heading", type: "textarea" },
      {
        name: "factors",
        label: "Cost factors",
        type: "objectList",
        itemFields: [
          { name: "icon", label: "Icon", type: "image" },
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "whyUs",
    label: "Why Us",
    component: "ServiceWhyUsSection",
    description: "Stat strip making the case for the clinic.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "stats",
        label: "Stats",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Stat", type: "text" },
          { name: "desc", label: "Caption", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "journey",
    label: "Video Journey",
    component: "ServiceJourneySection",
    description: "YouTube transformation videos.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      {
        name: "videos",
        label: "Videos",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Title", type: "text" },
          { name: "youtubeId", label: "YouTube ID", type: "text" },
          { name: "thumbnail", label: "Thumbnail", type: "image" },
        ],
      },
    ],
  },
  {
    key: "causes",
    label: "Causes",
    component: "ServiceCausesSection",
    description: "Why the problem occurs.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "causes",
        label: "Causes",
        type: "objectList",
        itemFields: [
          { name: "icon", label: "Icon", type: "image" },
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "whyChooseNexGen",
    label: "Why Choose NexGen",
    component: "ServiceWhyChooseNexGenSection",
    description: "Feature card grid.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "features",
        label: "Features",
        type: "objectList",
        itemFields: [
          { name: "image", label: "Image", type: "image" },
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "googleReviews",
    label: "Google Reviews",
    component: "GoogleReviews",
    description: "Shared reviews slider. Toggle only — content is global.",
    fields: [],
  },
  {
    key: "postSurgerySupport",
    label: "Post-Surgery Support",
    component: "ServicePostSurgerySupportSection",
    description: "Aftercare offered by the clinic.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
      {
        name: "supportItems",
        label: "Support items",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Title", type: "text" },
          { name: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "dosDonts",
    label: "Do's and Don'ts",
    component: "ServiceDosDontsSection",
    description: "Two aftercare lists.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      { name: "dos", label: "Do's", type: "stringList" },
      { name: "donts", label: "Don'ts", type: "stringList" },
    ],
  },
  {
    key: "recoveryTimeline",
    label: "Recovery Timeline",
    component: "ServiceRecoveryTimelineSection",
    description: "Week-by-week recovery tabs.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "weeks",
        label: "Timeline entries",
        type: "objectList",
        itemFields: [
          { name: "label", label: "Label", type: "text" },
          { name: "image", label: "Image", type: "image" },
          { name: "expectations", label: "What to expect", type: "stringList" },
          { name: "careGuidelines", label: "Care guidelines", type: "stringList" },
        ],
      },
    ],
  },
  {
    key: "bookingBar",
    label: "Booking Bar",
    component: "ServiceBookingBar",
    description: "Green call-to-action strip.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "patientCountText", label: "Patient count text", type: "text" },
    ],
  },
  {
    key: "comparison",
    label: "Technique Comparison",
    component: "ServiceComparisonSection",
    description: "Comparison cards across techniques.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "subtitle", label: "Sub-heading", type: "textarea" },
      {
        name: "cards",
        label: "Comparison cards",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Technique", type: "text" },
          { name: "purpose", label: "Purpose", type: "textarea" },
          { name: "effectiveness", label: "Effectiveness", type: "text" },
          { name: "risk", label: "Risk", type: "text" },
          { name: "cost", label: "Cost", type: "text" },
        ],
      },
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    component: "ServiceFAQSection",
    description: "Accordion of common questions.",
    fields: [
      { name: "title", label: "Heading", type: "text" },
      {
        name: "faqs",
        label: "Questions",
        type: "objectList",
        itemFields: [
          { name: "question", label: "Question", type: "text" },
          { name: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "contact",
    label: "Contact & Locations",
    component: "ContactSection",
    description: "Shared lead form with location cards. Toggle only.",
    fields: [],
  },
];

/** Render order on the landing page. */
export const SECTION_ORDER = SERVICE_SECTIONS.map((s) => s.key);

export function isKnownSection(key: string) {
  return SECTION_ORDER.includes(key);
}
