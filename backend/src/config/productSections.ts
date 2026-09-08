// ─────────────────────────────────────────────────────────────────────────────
// Product section schema — the single source of truth for what is editable on
// a product detail page in the ecommerce store. The admin panel fetches this
// from GET /products/schema and renders form accordions dynamically, exactly
// like the services module.
//
// Each `key` maps to a section component on the ecommerce detail page.
// Empty fields fall back to default components.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "image" | "stringList" | "objectList";

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  itemFields?: { name: string; label: string; type: "text" | "textarea" | "image" | "stringList" }[];
}

export interface SectionSchema {
  key: string;
  label: string;
  component: string;
  description: string;
  fields: SchemaField[];
}

const IMAGE_HELP = "Direct image URL link (paste URL or pick from Media Library)";

export const PRODUCT_SECTIONS: SectionSchema[] = [
  {
    key: "hero",
    label: "Hero & Gallery",
    component: "ProductDetailHero",
    description: "Product stage gallery images and 'Suitable For' clinical indications.",
    fields: [
      {
        name: "galleryImages",
        label: "Additional Gallery Images",
        type: "stringList",
        help: "Paste image URLs to display in the product gallery thumbnail carousel",
      },
      {
        name: "suitableFor",
        label: "Suitable For (Bullet Points)",
        type: "stringList",
        help: "Clinical candidate bullet points shown in the 'Suitable For' tab",
      },
    ],
  },
  {
    key: "whatsInside",
    label: "What's Inside Kit (Kits only)",
    component: "WhatsInsideKitSection",
    description: "Grid of included bundle items. Automatically displayed for Kits & Combos, hidden for single products.",
    fields: [
      { name: "title", label: "Section Title", type: "text", placeholder: "What's Inside Your Kit" },
      { name: "subtitle", label: "Section Subtitle", type: "text", placeholder: "WHAT'S INCLUDED" },
      {
        name: "items",
        label: "Kit Products List",
        type: "objectList",
        help: "Items included in this kit / combo bundle",
        itemFields: [
          { name: "title", label: "Product Title", type: "text" },
          { name: "description", label: "Short Description", type: "textarea" },
          { name: "image", label: "Product Image URL", type: "image" },
        ],
      },
    ],
  },
  {
    key: "keyBenefits",
    label: "Key Benefits",
    component: "KeyBenefitsSection",
    description: "Accordion of clinical benefits with a side hero portrait image.",
    fields: [
      { name: "title", label: "Section Title", type: "text", placeholder: "Key Benefits" },
      { name: "subtitle", label: "Section Subtitle", type: "text", placeholder: "EXPLORE OUR" },
      { name: "description", label: "Lead Paragraph", type: "textarea" },
      { name: "image", label: "Side Portrait Image", type: "image", help: IMAGE_HELP },
      {
        name: "benefits",
        label: "Benefit Accordion Points",
        type: "objectList",
        itemFields: [
          { name: "title", label: "Benefit Title", type: "text" },
          { name: "description", label: "Benefit Details", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "howToUse",
    label: "How To Use Instructions",
    component: "HowToUseSection",
    description: "Usage routine by time slots (Morning, Evening, Once Weekly) with a side image.",
    fields: [
      { name: "title", label: "Section Title", type: "text", placeholder: "How To Use" },
      { name: "subtitle", label: "Section Subtitle", type: "text", placeholder: "INSTRUCTIONS" },
      { name: "note", label: "Doctor Note", type: "text", placeholder: "To be used as directed by the doctor." },
      { name: "image", label: "Side Routine Image", type: "image", help: IMAGE_HELP },
      {
        name: "routines",
        label: "Routine Time Slots",
        type: "objectList",
        itemFields: [
          { name: "timeSlot", label: "Time Slot (e.g. Morning / Evening / Weekly)", type: "text" },
          { name: "title", label: "Step Title", type: "text" },
          { name: "instruction", label: "Step Instruction", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "faqs",
    label: "Product FAQs",
    component: "ProductFAQSection",
    description: "Frequently asked clinical and usage questions for this product.",
    fields: [
      { name: "title", label: "Section Title", type: "text", placeholder: "Frequently Asked Questions" },
      { name: "subtitle", label: "Section Subtitle", type: "text", placeholder: "EXPERT ANSWERS" },
      {
        name: "items",
        label: "FAQ Questions & Answers",
        type: "objectList",
        itemFields: [
          { name: "question", label: "Question", type: "text" },
          { name: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
];
