export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  gender: "male" | "female" | "other";
  dob?: string | null;
  age?: number | null;
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
  allergies?: string[] | null;
  chronicConditions?: string[] | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  createdBy?: { id: string; fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PatientVitals {
  id: string;
  patientId: string;
  queueEntryId?: string | null;
  appointmentId?: string | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  pulseRate?: number | null;
  temperature?: number | null;
  spO2?: number | null;
  bloodSugar?: number | null;
  sugarTestType?: "fasting" | "random" | "post_prandial";
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  chiefComplaint?: string | null;
  triageNotes?: string | null;
  recordedBy?: { id: string; fullName: string };
  recordedAt: string;
}

export interface QueueEntry {
  id: string;
  tokenNumber: string;
  queueDate: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  priority: "normal" | "follow_up" | "emergency" | "vip";
  status: "waiting" | "in_consultation" | "in_procedure" | "pending_billing" | "pending_pharmacy" | "completed" | "cancelled";
  queuedAt: string;
  calledAt?: string | null;
  completedAt?: string | null;
  patient?: Patient;
  doctor?: { id: string; fullName: string; department?: string; designation?: string };
  vitals?: PatientVitals;
  appointment?: { id: string; appointmentNumber: string; timeSlot: string; type: string };
  consultation?: Consultation;
  consultationInvoice?: Invoice | null;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  type: "new_consultation" | "follow_up" | "procedure" | "review";
  channel: "website" | "walk_in" | "phone" | "whatsapp";
  status: "scheduled" | "checked_in" | "cancelled" | "completed" | "no_show";
  reason?: string | null;
  cancellationReason?: string | null;
  patient?: Patient;
  doctor?: { id: string; fullName: string; department?: string; designation?: string };
  createdAt: string;
}

export interface PrescriptionItem {
  id?: string;
  prescriptionId?: string;
  medicineName: string;
  genericName?: string | null;
  dosageForm: "tablet" | "capsule" | "syrup" | "lotion" | "shampoo" | "injection" | "serum";
  strength?: string | null;
  frequency: string;
  durationValue: number;
  durationUnit: "days" | "weeks" | "months";
  timing: "before_food" | "after_food" | "with_food" | "at_bedtime" | "as_needed";
  instructions?: string | null;
  inventoryItemId?: string | null;
  inventoryItem?: { id: string; name: string; sku?: string; sellingPrice?: number; stockQuantity?: number; unit?: string };
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  generalAdvice?: string | null;
  status: "active" | "dispensed" | "cancelled";
  signedAt: string;
  patient?: Patient;
  doctor?: { id: string; fullName: string; department?: string; designation?: string; phone?: string };
  consultation?: Consultation;
  items?: PrescriptionItem[];
}

export interface Consultation {
  id: string;
  consultationNumber: string;
  patientId: string;
  doctorId: string;
  queueEntryId?: string | null;
  symptoms?: string | null;
  examinationFindings?: string | null;
  diagnosis: string;
  secondaryDiagnosis?: string | null;
  clinicalNotes?: string | null;
  proceduresRecommended?: string[] | null;
  investigationsAdvised?: string[] | null;
  followUpDate?: string | null;
  followUpInstructions?: string | null;
  status: "draft" | "finalized";
  consultationFee: number;
  startedAt: string;
  finalizedAt?: string | null;
  patient?: Patient;
  doctor?: { id: string; fullName: string; department?: string; designation?: string };
  prescription?: Prescription;
  invoice?: Invoice;
  queueEntry?: QueueEntry;
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  itemType: "consultation" | "procedure" | "medicine" | "lab_test" | "other";
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventoryItemId?: string | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  consultationId?: string | null;
  subtotal: number;
  discountAmount: number;
  discountReason?: string | null;
  taxAmount: number;
  netTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "paid" | "partial" | "pending" | "refunded";
  paymentMethod: "cash" | "card" | "upi" | "net_banking" | "split";
  paymentNotes?: string | null;
  billedBy?: { id: string; fullName: string };
  billedAt: string;
  patient?: Patient;
  items?: InvoiceItem[];
  consultation?: Consultation;
}
