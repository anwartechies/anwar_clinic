import { Job } from "../models";

export const INITIAL_JOBS_SEED = [
  {
    title: "Hair Transplant Surgeon (FUE & DHI)",
    slug: "hair-transplant-surgeon-fue-dhi",
    department: "Medical / Surgical",
    location: "Patna Clinic (Razabazar)",
    employmentType: "Full-time" as const,
    experience: "3-5+ Years",
    salaryRange: "₹12,00,000 – ₹24,00,000 / year",
    openings: 2,
    description:
      "We are seeking an experienced and dedicated Hair Transplant Surgeon to lead our clinical surgical sessions. You will perform state-of-the-art Follicular Unit Extraction (FUE) and Direct Hair Implantation (DHI) procedures, design age-appropriate natural hairlines, and ensure exceptional follicle viability and patient satisfaction.",
    responsibilities: [
      "Conduct pre-procedure trichoscopic evaluations, scalp assessments, and donor area mapping.",
      "Design personalized, natural, and geometrically balanced hairlines tailored to facial structure.",
      "Perform micro-extraction of follicular units and direct implantation using advanced sapphire and DHI implanter tools.",
      "Oversee OT technicians and nursing staff during surgical sessions to maintain sterile protocols.",
      "Provide comprehensive post-operative consultations and follow-up reviews.",
    ],
    requirements: [
      "MBBS with MS / MD / DNB / DVD / MCh in General Surgery, Dermatology, or Plastic Surgery.",
      "Valid registration with the State Medical Council / National Medical Commission (NMC).",
      "Demonstrated hands-on experience of at least 300+ successful FUE / DHI hair transplant procedures.",
      "Expertise in artistic hairline design, temple angle restoration, and crown swirl reconstruction.",
      "Strong communication and bedside manner with empathy for patients dealing with hair loss.",
    ],
    benefits: [
      "Highly competitive salary package with performance incentives.",
      "Work in state-of-the-art hospital-grade sterile surgical theaters.",
      "Continuous professional training and exposure to international restoration methodologies.",
      "Comprehensive medical insurance coverage.",
      "Structured work hours with balanced surgical schedules.",
    ],
    status: "published" as const,
    sortOrder: 1,
  },
  {
    title: "Senior OT Staff Nurse - Hair Restoration",
    slug: "senior-ot-staff-nurse-hair-restoration",
    department: "Nursing & OT",
    location: "Patna Clinic (Razabazar)",
    employmentType: "Full-time" as const,
    experience: "2-4 Years",
    salaryRange: "₹3,60,000 – ₹6,00,000 / year",
    openings: 3,
    description:
      "Join our dedicated surgical theater team as a Senior OT Staff Nurse. You will be responsible for maintaining supreme theater sterility, patient vitals monitoring, anesthesia administration assistance, and supporting hair restoration surgeons throughout procedures.",
    responsibilities: [
      "Prepare and sterilize OT suites, surgical instruments, and micro-punches prior to surgery.",
      "Assist surgeons with local anesthesia administration and continuous intraoperative vital signs monitoring.",
      "Ensure patient comfort, hygiene, and positioning throughout multi-hour transplant sessions.",
      "Oversee post-transplant head washing, bandage application, and first-day dressing removal protocols.",
      "Educate patients on medication schedules, donor-care routines, and post-op sleep postures.",
    ],
    requirements: [
      "B.Sc Nursing or GNM (General Nursing and Midwifery) from an accredited institution.",
      "Valid registration with the State Nursing Council.",
      "Minimum 2 years of clinical OT experience (prior hair transplant, dermatology, or cosmetic surgery experience preferred).",
      "Proficiency in IV cannulation, emergency protocol management, and strict aseptic techniques.",
      "Compassionate attitude and strong interpersonal skills.",
    ],
    benefits: [
      "Competitive salary with timely annual appraisals.",
      "Day-shift surgical schedules with fixed working hours.",
      "Health and accidental insurance coverage.",
      "Provident Fund (EPF) and ESI benefits.",
      "Supportive clinical environment with growth pathways to OT Supervisor.",
    ],
    status: "published" as const,
    sortOrder: 2,
  },
  {
    title: "Hair Restoration & Graft Technician",
    slug: "hair-restoration-graft-technician",
    department: "Clinical Technicians",
    location: "Patna Clinic (Razabazar)",
    employmentType: "Full-time" as const,
    experience: "1-3 Years",
    salaryRange: "₹3,00,000 – ₹5,00,000 / year",
    openings: 4,
    description:
      "We are looking for skilled Hair Technicians with acute attention to detail. You will be instrumental in microscopic graft inspection, follicle sorting, cold-storage preservation, and loading direct implanter pens during high-density hair restoration surgeries.",
    responsibilities: [
      "Carefully inspect, sort, and count extracted grafts under high-magnification stereomicroscopes.",
      "Maintain grafts in chilled preservation solution (DMEM / Hypothermosol) to guarantee maximum viability.",
      "Load follicular units into direct implanter pens swiftly without root trauma.",
      "Assist the lead surgeon with graft placement alignment and counting accuracy.",
      "Maintain surgical instrument hygiene, punch tip sharpness, and sterilization records.",
    ],
    requirements: [
      "Diploma / Degree in Medical Lab Technology (DMLT), OT Technology, or relevant biological sciences.",
      "Prior hands-on experience in graft handling, sorting, or slivering in hair transplant clinics.",
      "Excellent hand-eye coordination, patience, and fine motor skills under magnification.",
      "Ability to stay focused during long micro-surgical procedures.",
    ],
    benefits: [
      "Performance-linked procedure bonuses per surgery.",
      "On-the-job training with modern implanter pens and sapphire blade techniques.",
      "Friendly, collaborative team culture.",
      "Uniform and daily clinic meal allowances.",
    ],
    status: "published" as const,
    sortOrder: 3,
  },
  {
    title: "Patient Care & Scalp Consultant",
    slug: "patient-care-scalp-consultant",
    department: "Counseling & Patient Care",
    location: "Patna Clinic (Razabazar)",
    employmentType: "Full-time" as const,
    experience: "1-3 Years",
    salaryRange: "₹3,50,000 – ₹6,50,000 / year",
    openings: 2,
    description:
      "Help prospective patients navigate their hair restoration journey. You will provide initial consultations, conduct scalp analyses, explain procedure techniques (FUE, BIO-FUE, DHI), and guide patients through transparent pricing and financing options.",
    responsibilities: [
      "Welcome walk-in and digital consultation leads, understanding their degree of hair loss and goals.",
      "Perform digital trichoscopic scalp assessments and photograph donor areas under doctor supervision.",
      "Explain procedure steps, graft requirements, package pricing, and payment/EMI options clearly.",
      "Coordinate surgery dates, doctor appointments, and pre-op blood testing schedules.",
      "Maintain post-procedure check-ins to ensure patient satisfaction at 1, 3, 6, and 12-month milestones.",
    ],
    requirements: [
      "Bachelor's degree in any discipline (Life Sciences, Healthcare Management, or Hospitality preferred).",
      "1-3 years of counseling, healthcare sales, or patient coordination experience in aesthetics, dermatology, or dental clinics.",
      "Fluency in Hindi and English with polished verbal and written communication.",
      "Empathetic, consultative, and customer-first mindset.",
    ],
    benefits: [
      "Attractive base salary plus monthly consultation conversion incentives.",
      "Fast-track growth opportunities into Clinic Operations Management.",
      "Comprehensive medical insurance.",
      "Professional corporate grooming and sales training.",
    ],
    status: "published" as const,
    sortOrder: 4,
  },
];

export async function syncSeedJobsOnBoot() {
  try {
    const count = await Job.count();
    if (count === 0) {
      console.log("[Jobs] Seeding initial hair transplant clinic jobs...");
      for (const item of INITIAL_JOBS_SEED) {
        await Job.create(item);
      }
      console.log(`[Jobs] Successfully seeded ${INITIAL_JOBS_SEED.length} job openings.`);
    }
  } catch (err: any) {
    console.error("[Jobs] Seed error:", err.message);
  }
}
