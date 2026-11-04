# Anwar Clinic — Clinical Management System Detailed Implementation Plan

**Associated Document:** [`CLINICAL_WORKFLOW_AND_PANEL_ARCHITECTURE.md`](./CLINICAL_WORKFLOW_AND_PANEL_ARCHITECTURE.md)  
**Target Applications:** `backend` (Node.js/Express/PostgreSQL), `admin-panel` (Next.js 16/React 19/Tailwind v4)  
**Version:** 1.0.0  
**Status:** Ready for Execution  

---

## Table of Contents
1. [Implementation Architecture & Phasing Strategy](#1-implementation-architecture--phasing-strategy)
2. [Phase 1: Database Foundation & Domain Models (Backend)](#2-phase-1-database-foundation--domain-models-backend)
3. [Phase 2: Core REST API Endpoints & Business Logic (Backend)](#3-phase-2-core-rest-api-endpoints--business-logic-backend)
4. [Phase 3: Receptionist Intake, Vitals & Queue Desk (Frontend)](#4-phase-3-receptionist-intake-vitals--queue-desk-frontend)
5. [Phase 4: Appointments Scheduling & Slot Management (Frontend)](#5-phase-4-appointments-scheduling--slot-management-frontend)
6. [Phase 5: Doctor Consultation Room & E-Prescription Suite (Frontend)](#6-phase-5-doctor-consultation-room--e-prescription-suite-frontend)
7. [Phase 6: Billing, Invoicing & Cashier POS (Frontend)](#7-phase-6-billing-invoicing--cashier-pos-frontend)
8. [Phase 7: Role-Specific Dynamic Dashboards & Reports (Frontend)](#8-phase-7-role-specific-dynamic-dashboards--reports-frontend)
9. [Phase 8: End-to-End Verification & Validation Runbook](#9-phase-8-end-to-end-verification--validation-runbook)
10. [File Creation & Modification Checklist](#10-file-creation--modification-checklist)

---

## 1. Implementation Architecture & Phasing Strategy

The clinical modules interact closely through state transitions:

```
[Phase 1: DB Schema & Models]
       │
       ▼
[Phase 2: Backend REST APIs & Queue Engine]
       │
       ├───────────────────────────────────────────────┐
       ▼                                               ▼
[Phase 3: Reception & Vitals Desk]           [Phase 4: Appointments]
       │                                               │
       └───────────────────────┬───────────────────────┘
                               ▼
            [Phase 5: Doctor Consultation & Rx]
                               │
                               ▼
            [Phase 6: Billing & Invoicing POS]
                               │
                               ▼
            [Phase 7: Dynamic Dashboards & Reports]
                               │
                               ▼
            [Phase 8: End-to-End Integration Testing]
```

### Key Technical Decisions
1. **Backward Compatibility:** All existing database tables (`Users`, `Roles`, `InventoryItems`, `Services`, etc.) remain intact. New models hook cleanly into `User` and `InventoryItem`.
2. **Dynamic RBAC Integrity:** New clinical permissions (`vitals:read`, `vitals:write`, `queue:read`, `queue:write`, `consultation:write`) are registered directly into `Permission.ts` and the frontend `PERMISSION_LABELS` catalog.
3. **Optimistic Queue & Polling/SWR:** The Live Queue uses Next.js lightweight interval polling (or server-sent events) with React 19 optimistic UI updates for instant token transitions.
4. **Shared Types:** Type definitions are mirrored accurately between backend models and frontend `types.ts` files to guarantee type safety across the monorepo.

---

## 2. Phase 1: Database Foundation & Domain Models (Backend)

### 2.1 New Sequelize Models to Create in `backend/src/models/`

#### 1. `Patient.ts`
- **File:** `backend/src/models/Patient.ts`
- **Columns:**
  - `id`: UUID, primary key, default `DataTypes.UUIDV4`
  - `mrn`: String(32), unique, indexed (e.g. `ANW-26-0001`)
  - `firstName`: String(100), not null
  - `lastName`: String(100), not null
  - `phone`: String(20), not null, indexed
  - `email`: String(150), nullable
  - `gender`: Enum (`male`, `female`, `other`), not null
  - `dob`: DateOnly, nullable
  - `age`: Integer, nullable
  - `bloodGroup`: Enum (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), nullable
  - `allergies`: JSONB / Array of strings (e.g. `["Penicillin", "NSAIDs"]`)
  - `chronicConditions`: JSONB / Array of strings (e.g. `["Hypertension"]`)
  - `emergencyContactName`: String(100), nullable
  - `emergencyContactPhone`: String(20), nullable
  - `address`: Text, nullable
  - `city`: String(100), nullable
  - `notes`: Text, nullable
  - `createdById`: UUID, foreign key -> `User`

#### 2. `Appointment.ts`
- **File:** `backend/src/models/Appointment.ts`
- **Columns:**
  - `id`: UUID, primary key
  - `appointmentNumber`: String(32), unique (e.g. `APT-2609-001`)
  - `patientId`: UUID, foreign key -> `Patient`, not null
  - `doctorId`: UUID, foreign key -> `User`, not null
  - `appointmentDate`: DateOnly, not null, indexed
  - `timeSlot`: String(30), not null (e.g. `10:30-11:00`)
  - `type`: Enum (`new_consultation`, `follow_up`, `procedure`, `review`), default `new_consultation`
  - `channel`: Enum (`website`, `walk_in`, `phone`, `whatsapp`), default `walk_in`
  - `status`: Enum (`scheduled`, `checked_in`, `cancelled`, `completed`, `no_show`), default `scheduled`
  - `reason`: Text, nullable
  - `cancellationReason`: Text, nullable
  - `createdById`: UUID, foreign key -> `User`

#### 3. `QueueEntry.ts`
- **File:** `backend/src/models/QueueEntry.ts`
- **Columns:**
  - `id`: UUID, primary key
  - `tokenNumber`: String(20), not null (e.g. `TK-014`)
  - `queueDate`: DateOnly, not null, indexed (e.g. `2026-09-29`)
  - `patientId`: UUID, foreign key -> `Patient`, not null
  - `doctorId`: UUID, foreign key -> `User`, not null
  - `appointmentId`: UUID, foreign key -> `Appointment`, nullable
  - `priority`: Enum (`normal`, `follow_up`, `emergency`, `vip`), default `normal`
  - `status`: Enum (`waiting`, `in_consultation`, `in_procedure`, `pending_billing`, `completed`, `cancelled`), default `waiting`, indexed
  - `queuedAt`: Date, not null, default `NOW`
  - `calledAt`: Date, nullable
  - `completedAt`: Date, nullable
  - `createdById`: UUID, foreign key -> `User`

#### 4. `PatientVitals.ts`
- **File:** `backend/src/models/PatientVitals.ts`
- **Columns:**
  - `id`: UUID, primary key
  - `patientId`: UUID, foreign key -> `Patient`, not null
  - `queueEntryId`: UUID, foreign key -> `QueueEntry`, nullable
  - `appointmentId`: UUID, foreign key -> `Appointment`, nullable
  - `bpSystolic`: Integer, nullable (e.g. `120`)
  - `bpDiastolic`: Integer, nullable (e.g. `80`)
  - `pulseRate`: Integer, nullable (e.g. `74`)
  - `temperature`: Decimal(4, 1), nullable (e.g. `98.4`)
  - `spO2`: Integer, nullable (e.g. `99`)
  - `bloodSugar`: Integer, nullable (e.g. `110`)
  - `sugarTestType`: Enum (`fasting`, `random`, `post_prandial`), default `random`
  - `weightKg`: Decimal(5, 2), nullable (e.g. `72.5`)
  - `heightCm`: Decimal(5, 2), nullable (e.g. `175.0`)
  - `bmi`: Decimal(4, 1), nullable (calculated: `weight / (height/100)^2`)
  - `chiefComplaint`: Text, nullable
  - `triageNotes`: Text, nullable
  - `recordedById`: UUID, foreign key -> `User`, not null

#### 5. `Consultation.ts`
- **File:** `backend/src/models/Consultation.ts`
- **Columns:**
  - `id`: UUID, primary key
  - `consultationNumber`: String(32), unique (e.g. `CNS-2609-001`)
  - `patientId`: UUID, foreign key -> `Patient`, not null
  - `doctorId`: UUID, foreign key -> `User`, not null
  - `queueEntryId`: UUID, foreign key -> `QueueEntry`, nullable
  - `symptoms`: Text, nullable
  - `examinationFindings`: Text, nullable
  - `diagnosis`: Text, not null (Primary clinical diagnosis)
  - `secondaryDiagnosis`: Text, nullable
  - `clinicalNotes`: Text, nullable
  - `proceduresRecommended`: JSONB / Array of strings (e.g. `["PRP Scalp Session 1"]`)
  - `investigationsAdvised`: JSONB / Array of strings (e.g. `["Serum Ferritin", "CBC"]`)
  - `followUpDate`: DateOnly, nullable
  - `followUpInstructions`: Text, nullable
  - `status`: Enum (`draft`, `finalized`), default `draft`
  - `consultationFee`: Decimal(10, 2), default `0.00`
  - `startedAt`: Date, not null, default `NOW`
  - `finalizedAt`: Date, nullable

#### 6. `Prescription.ts` & `PrescriptionItem.ts`
- **Files:** `backend/src/models/Prescription.ts`, `backend/src/models/PrescriptionItem.ts`
- **`Prescription` Columns:**
  - `id`: UUID, primary key
  - `prescriptionNumber`: String(32), unique (e.g. `RX-2609-001`)
  - `consultationId`: UUID, foreign key -> `Consultation`, not null
  - `patientId`: UUID, foreign key -> `Patient`, not null
  - `doctorId`: UUID, foreign key -> `User`, not null
  - `generalAdvice`: Text, nullable
  - `status`: Enum (`active`, `dispensed`, `cancelled`), default `active`
  - `signedAt`: Date, default `NOW`
- **`PrescriptionItem` Columns:**
  - `id`: UUID, primary key
  - `prescriptionId`: UUID, foreign key -> `Prescription`, not null
  - `medicineName`: String(200), not null
  - `genericName`: String(200), nullable
  - `dosageForm`: Enum (`tablet`, `capsule`, `syrup`, `lotion`, `shampoo`, `injection`, `serum`), default `tablet`
  - `strength`: String(50), nullable (e.g. `5%` or `1mg`)
  - `frequency`: String(50), not null (e.g. `1-0-1`, `1-0-0`, `0-0-1`, `1-1-1`)
  - `durationValue`: Integer, not null (e.g. `30`)
  - `durationUnit`: Enum (`days`, `weeks`, `months`), default `days`
  - `timing`: Enum (`before_food`, `after_food`, `with_food`, `at_bedtime`, `as_needed`), default `after_food`
  - `instructions`: Text, nullable (e.g. `Apply 1ml at night on dry scalp`)
  - `inventoryItemId`: UUID, foreign key -> `InventoryItem`, nullable

#### 7. `Invoice.ts` & `InvoiceItem.ts`
- **Files:** `backend/src/models/Invoice.ts`, `backend/src/models/InvoiceItem.ts`
- **`Invoice` Columns:**
  - `id`: UUID, primary key
  - `invoiceNumber`: String(32), unique (e.g. `INV-2026-0001`)
  - `patientId`: UUID, foreign key -> `Patient`, not null
  - `consultationId`: UUID, foreign key -> `Consultation`, nullable
  - `subtotal`: Decimal(10, 2), not null, default `0.00`
  - `discountAmount`: Decimal(10, 2), default `0.00`
  - `discountReason`: String(200), nullable
  - `taxAmount`: Decimal(10, 2), default `0.00`
  - `netTotal`: Decimal(10, 2), not null, default `0.00`
  - `paidAmount`: Decimal(10, 2), default `0.00`
  - `balanceDue`: Decimal(10, 2), default `0.00`
  - `paymentStatus`: Enum (`paid`, `partial`, `pending`, `refunded`), default `pending`
  - `paymentMethod`: Enum (`cash`, `card`, `upi`, `net_banking`, `split`), default `cash`
  - `paymentNotes`: Text, nullable
  - `billedById`: UUID, foreign key -> `User`, not null
  - `billedAt`: Date, default `NOW`
- **`InvoiceItem` Columns:**
  - `id`: UUID, primary key
  - `invoiceId`: UUID, foreign key -> `Invoice`, not null
  - `itemType`: Enum (`consultation`, `procedure`, `medicine`, `lab_test`, `other`), not null
  - `description`: String(255), not null
  - `quantity`: Integer, not null, default `1`
  - `unitPrice`: Decimal(10, 2), not null
  - `totalPrice`: Decimal(10, 2), not null
  - `inventoryItemId`: UUID, foreign key -> `InventoryItem`, nullable

---

### 2.2 Wire Associations in `backend/src/models/index.ts`
Add the following relations in `models/index.ts`:
- `Patient` has many `Appointments`, `QueueEntries`, `PatientVitals`, `Consultations`, `Prescriptions`, `Invoices`.
- `QueueEntry` belongs to `Patient`, `User` (as `doctor`), `Appointment` (optional).
- `QueueEntry` has one `PatientVitals`, has one `Consultation`.
- `Consultation` belongs to `Patient`, `User` (as `doctor`), `QueueEntry`.
- `Consultation` has one `Prescription`, has one `Invoice`.
- `Prescription` belongs to `Consultation`, `Patient`, `User` (as `doctor`).
- `Prescription` has many `PrescriptionItems`.
- `PrescriptionItem` belongs to `InventoryItem` (optional).
- `Invoice` belongs to `Patient`, `Consultation` (optional), `User` (as `billedBy`).
- `Invoice` has many `InvoiceItems`.
- `InvoiceItem` belongs to `InventoryItem` (optional).

### 2.3 Register Permissions in `backend/src/models/Permission.ts` & Seed Script
Register the following permission keys:
- `appointments:read`, `appointments:write`
- `patients:read`, `patients:write`
- `vitals:read`, `vitals:write`
- `queue:read`, `queue:write`
- `consultation:write`
- `prescriptions:read`, `prescriptions:write`
- `billing:read`, `billing:write`
- `reports:read`

---

## 3. Phase 2: Core REST API Endpoints & Business Logic (Backend)

Create distinct, cleanly structured route files in `backend/src/routes/`:

### 3.1 `patients.ts` (`/patients`)
- `GET /patients`: Paginated list of patients with search (`?search=987654` or name), sort, and filters.
- `POST /patients`: Create new patient.
  - **Business Logic:** Automatically generate unique MRN format: `ANW-${YY}-${paddedSequence}` (e.g. `ANW-26-00123`).
- `GET /patients/:id`: Full 360° patient details including active queue state, latest vitals, and last visit date.
- `PUT /patients/:id`: Update patient demographics and medical history.
- `GET /patients/:id/timeline`: Aggregate historical visits, consultations, vitals, prescriptions, and invoices in reverse chronological order.

### 3.2 `vitals.ts` (`/vitals`)
- `POST /vitals`: Record vitals for a patient visit.
  - **Business Logic:** Automatically compute `bmi = weightKg / ((heightCm / 100) ** 2)`. Flag abnormal values (`isAbnormalBP`, `isFever`, `isHypoxic`).
- `GET /vitals/patient/:patientId`: Retrieve historical vitals timeline for trending graphs.

### 3.3 `queue.ts` (`/queue`)
- `GET /queue/today`: Returns today's active waiting queue.
  - Filterable by `?doctorId=...` or `?status=...`.
  - Grouped counts: `{ waiting: X, inConsultation: Y, pendingBilling: Z, completed: W }`.
- `POST /queue/checkin`: Issue token and enqueue patient.
  - **Business Logic:** Generate daily auto-incrementing token e.g. `TK-001` or `A-10` for doctor. Status -> `waiting`. If appointment exists, transition appointment status to `checked_in`.
- `PATCH /queue/:id/call`: Doctor calls patient. Status -> `in_consultation`, sets `calledAt = NOW()`.
- `PATCH /queue/:id/reassign`: Move patient to another doctor chamber.
- `PATCH /queue/:id/cancel`: Cancel token if patient leaves.

### 3.4 `appointments.ts` (`/appointments`)
- `GET /appointments`: Filter by doctor, date range, status, or search query.
- `POST /appointments`: Book new slot. Validate against overlapping bookings for the same doctor and slot.
- `PATCH /appointments/:id/reschedule`: Change appointment date/slot.
- `PATCH /appointments/:id/cancel`: Cancel with cancellation reason.
- `POST /appointments/:id/checkin`: Direct check-in that creates `QueueEntry` and moves status to `checked_in`.

### 3.5 `consultations.ts` & `prescriptions.ts` (`/consultations`, `/prescriptions`)
- `POST /consultations`: Doctor opens or saves draft consultation notes.
- `GET /consultations/:id`: Retrieve consultation note with patient vitals and existing prescription items.
- `POST /consultations/:id/finalize`: Complete consultation.
  - **Atomic Transaction:**
    1. Mark consultation as `finalized`, set `finalizedAt = NOW()`.
    2. Create `Prescription` and associated `PrescriptionItem` records.
    3. Update `QueueEntry` status to `pending_billing`.
    4. Auto-generate draft `Invoice` with consultation fee + prescribed medicines matching inventory items.

### 3.6 `billing.ts` (`/billing`)
- `GET /billing/pending`: List all visits with status `pending_billing`.
- `GET /billing/invoices`: Paginated invoice history with payment status filters (`paid`, `pending`, `partial`).
- `POST /billing/invoices`: Create or finalize invoice with itemized breakdown.
- `POST /billing/invoices/:id/collect-payment`: Record payment amount, payment method (Cash, UPI, Card, Split), update `paidAmount`, `balanceDue`, and transition `QueueEntry` status to `completed` (Discharged).
- `GET /billing/invoices/:id/receipt`: Data payload optimized for thermal/A4 print receipt.

### 3.7 `reports.ts` (`/reports`)
- `GET /reports/daily-cash`: Cash collection summary grouped by payment method and cashier.
- `GET /reports/doctor-productivity`: Patient count, average consult duration, and consultation revenue per doctor.
- `GET /reports/opd-wait-times`: Metrics on time elapsed from check-in to consultation room.
- `GET /reports/inventory-dispense`: List of medicines prescribed and inventory deducted.

### 3.8 Mount Routes in `backend/src/app.ts`
Mount all new routes under standard endpoints:
```typescript
app.use("/patients", patientsRoutes);
app.use("/vitals", vitalsRoutes);
app.use("/queue", queueRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/consultations", consultationsRoutes);
app.use("/prescriptions", prescriptionsRoutes);
app.use("/billing", billingRoutes);
app.use("/reports", reportsRoutes);
```

---

## 4. Phase 3: Receptionist Intake, Vitals & Queue Desk (Frontend)

Directory: `admin-panel/components/Reception/` & `admin-panel/components/Patients/`

### 4.1 Components to Build
1. **`QuickPatientModal.tsx`:** Fast 1-minute patient registration form with mobile number deduplication check.
2. **`RecordVitalsModal.tsx`:**
   - Input fields: Systolic/Diastolic BP, Pulse, Temperature, SpO2, Random Blood Sugar, Weight, Height.
   - Live BMI computation widget with green/amber/red indicator.
   - Vital alert banners if numbers breach clinical safety thresholds.
   - Chief complaint textarea.
   - Doctor selection dropdown with current waiting count per doctor.
   - "Save & Issue Token" submit button.
3. **`LiveQueueBoard.tsx`:**
   - Real-time queue view with tabs: `All Doctors`, `Dr. Anwar`, `Dr. Sarah`.
   - Token card showing Token #, Patient Name, Phone, Wait time timer, Priority badge, Doctor chamber.
   - Quick actions: *Reassign*, *Print Token Slip*, *Cancel*.
4. **`TokenSlipPrint.tsx`:** Thermal slip layout displaying Clinic Logo, Date/Time, Token Number (large font), Doctor Name, and Patient Name.
5. **Page Entry:** Implement in `admin-panel/app/[role]/patients/page.tsx` with tabs:
   - Tab 1: **Live Queue & Check-In Desk** (for receptionists & triage nurses).
   - Tab 2: **Patient Directory** (search, filters, and export).

---

## 5. Phase 4: Appointments Scheduling & Slot Management (Frontend)

Directory: `admin-panel/components/Appointments/`

### 5.1 Components to Build
1. **`AppointmentCalendar.tsx`:**
   - Interactive calendar with Day, Week, and Month views.
   - Doctor filter dropdown.
   - Visual slot status indicators (Available, Booked, Checked-in, Leave).
2. **`BookAppointmentModal.tsx`:**
   - Search existing patient by phone/name or toggle "New Patient".
   - Doctor selector and service/consultation type picker.
   - Date picker and dynamic time slot grid based on doctor's working schedule.
   - Booking source tag (`Walk-in`, `Phone`, `Website`, `WhatsApp`).
3. **`AppointmentActionsDrawer.tsx`:**
   - Actions: `Check-in Now` (launches Vitals modal and queues patient), `Reschedule`, `Cancel`.
4. **Page Entry:** Replace placeholder in `admin-panel/app/[role]/appointments/page.tsx`.

---

## 6. Phase 5: Doctor Consultation Room & E-Prescription Suite (Frontend)

Directory: `admin-panel/components/Consultation/` & `admin-panel/components/Prescriptions/`

### 6.1 Components to Build
1. **`DoctorQueueBar.tsx`:**
   - Prominent header widget displaying:
     - Currently consulting patient card with "In Progress" badge.
     - "Next in Line" list with token numbers and arrival times.
     - Primary button: `Call Next Patient` (advances the queue).
2. **`ConsultationWorkspace.tsx` (Split-Screen Layout):**
   - **Left Panel — Patient Health Summary:**
     - Patient avatar, Name, Age, Gender, Blood group, MRN.
     - Red Alert Banner: Allergies & chronic medical risks.
     - Today's Vitals Card with highlighted abnormal readings.
     - Expandable accordion of past consultations and prescriptions.
   - **Right Panel — Clinical Encounter Form:**
     - Chief Complaint (prefilled from triage, doctor can edit).
     - Clinical Examination & Diagnosis autocomplete.
     - **Prescription Drug Builder (`MedicineTableBuilder.tsx`):**
       - Drug autocomplete searching clinic inventory (`InventoryItem`).
       - Form selector: Tablet, Capsule, Lotion, Shampoo, Foam, Serum.
       - Frequency selector chips: `1-0-0`, `1-0-1`, `0-0-1`, `1-1-1`, `Once Weekly`.
       - Food timing selector: `Before Food`, `After Food`, `At Bedtime`.
       - Duration: `15 Days`, `30 Days`, `60 Days`, `90 Days`.
       - Auto-calculated total quantity.
     - Recommended Lab Investigations & Aesthetic Procedures selector.
     - Doctor Advice textarea and Follow-up date picker (`1 week`, `2 weeks`, `1 month`, custom).
     - Action button: `Sign & Finalize Prescription` (submits encounter, generates prescription, and advances queue to `pending_billing`).
3. **`PrescriptionPrintLayout.tsx`:**
   - Clean, professional A4/A5 medical letterhead format:
     - Clinic header, doctor registration details, patient demographics, vitals summary, Rx table, clinical diagnosis, follow-up instructions, and doctor's digital signature.
4. **Page Entry:** Replace placeholder in `admin-panel/app/[role]/prescriptions/page.tsx` and provide direct consultation link from doctor dashboard.

---

## 7. Phase 6: Billing, Invoicing & Cashier POS (Frontend)

Directory: `admin-panel/components/Billing/`

### 7.1 Components to Build
1. **`PendingBillingQueue.tsx`:**
   - Real-time list of patients with status `pending_billing`.
   - Displays Token #, Patient Name, Doctor, and "Create Invoice" button.
2. **`InvoiceModal.tsx`:**
   - Auto-populates line items:
     - Consultation fee from doctor encounter.
     - Prescribed medicines matched with inventory selling prices.
     - In-clinic procedures (e.g. PRP therapy, Scalp micro-pigmentation).
   - Editable quantity and unit price.
   - Discount engine (flat discount or percentage with reason).
   - Tax/GST calculation toggle (0%, 5%, 12%, 18%).
   - Total Net Amount payable.
3. **`PaymentCollectionModal.tsx`:**
   - Payment method buttons: `Cash`, `UPI / QR Code`, `Card`, `Split`.
   - Cash tender calculator: Amount received vs Change due.
   - Split payment fields: e.g. ₹2,000 UPI + ₹1,500 Cash.
   - Submit action: Updates status to `completed` (Discharged) and triggers receipt print.
4. **`InvoiceReceiptPrint.tsx`:**
   - Supports both 80mm thermal receipt printer layout and formal A4 GST tax invoice layout.
5. **Page Entry:** Replace placeholder in `admin-panel/app/[role]/billing/page.tsx`.

---

## 8. Phase 7: Role-Specific Dynamic Dashboards & Reports (Frontend)

Directory: `admin-panel/components/Dashboard/` & `admin-panel/components/Reports/`

### 8.1 Role-Specific Dashboard Views in `admin-panel/app/[role]/dashboard/page.tsx`
Detect logged-in user's role and render tailored dashboards:

1. **Doctor Dashboard (`DoctorDashboard.tsx`):**
   - Active Consultation Card (current patient in chamber with quick action to open consultation note).
   - Upcoming Patient Queue (waiting lobby list).
   - Stats: Total Patients Consulted Today, Average Consult Time, Pending Follow-ups.
2. **Receptionist Dashboard (`ReceptionistDashboard.tsx`):**
   - Live Clinic Traffic (Waiting in Lobby, In Doctor Chambers, Pending Billing).
   - Quick Action buttons: `+ Register Walk-In`, `Record Vitals & Token`, `Book Appointment`.
   - Doctor Chamber Occupancy Grid.
3. **Admin Dashboard (`AdminDashboard.tsx`):**
   - Total Revenue Today & Month-to-date (with trends).
   - Patient Footfall (New vs Returning).
   - Operational Alerts (Low stock medicines, appointment conversions).

### 8.2 Clinical & Financial Reports in `admin-panel/app/[role]/reports/page.tsx`
1. **`DailyCashReport.tsx`:** Cashier collection breakdown by payment method.
2. **`DoctorProductivityReport.tsx`:** Patient counts and revenue generated per doctor.
3. **`OpdFlowReport.tsx`:** Average wait time from check-in to consultation.
4. **`InventoryDispenseReport.tsx`:** Dispensed medicines from clinic inventory.
5. Export to CSV / Print to PDF capabilities on all report tables.

---

## 9. Phase 8: End-to-End Verification & Validation Runbook

Execute this verification sequence to test the entire patient journey:

```
[Step 1] Seed Doctors, Staff & Inventory Medicines
    │
    ▼
[Step 2] Receptionist checks in Walk-in Patient -> Records Vitals -> Issues Token #TK-001
    │   Verification: Queue shows 1 waiting patient, status = 'waiting'
    │
    ▼
[Step 3] Doctor opens Doctor Dashboard -> Clicks "Call Patient TK-001"
    │   Verification: Queue status transitions to 'in_consultation'
    │
    ▼
[Step 4] Doctor reviews Vitals, enters Diagnosis, adds 2 Prescribed Medicines, clicks "Finalize"
    │   Verification: Prescription created, Queue status transitions to 'pending_billing'
    │
    ▼
[Step 5] Cashier opens Billing screen -> Sees pending invoice for TK-001
    │   Verification: Line items include Doctor Fee + 2 Prescribed Medicines
    │
    ▼
[Step 6] Cashier collects ₹2,500 via UPI -> Clicks "Pay & Discharge"
    │   Verification: Queue status transitions to 'completed', Receipt prints
    │
    ▼
[Step 7] Open Admin Dashboard & Reports
    │   Verification: Revenue reflects ₹2,500, Patient footfall increments by 1
```

---

## 10. File Creation & Modification Checklist

### Backend Files

| Action | Path | Description |
|---|---|---|
| **Create** | `backend/src/models/Patient.ts` | Patient demographic and medical record model |
| **Create** | `backend/src/models/Appointment.ts` | Appointment booking and schedule model |
| **Create** | `backend/src/models/QueueEntry.ts` | Live daily OPD waiting queue model |
| **Create** | `backend/src/models/PatientVitals.ts` | Patient physical measurements and triage model |
| **Create** | `backend/src/models/Consultation.ts` | Doctor clinical consultation encounter model |
| **Create** | `backend/src/models/Prescription.ts` | Digital prescription master model |
| **Create** | `backend/src/models/PrescriptionItem.ts` | Prescribed medicine line item model |
| **Create** | `backend/src/models/Invoice.ts` | Financial invoice and billing model |
| **Create** | `backend/src/models/InvoiceItem.ts` | Invoice line item model |
| **Modify** | `backend/src/models/index.ts` | Register new models, foreign keys, and associations |
| **Modify** | `backend/src/models/Permission.ts` | Seed new clinical permissions |
| **Create** | `backend/src/routes/patients.ts` | Patient registry and timeline endpoints |
| **Create** | `backend/src/routes/vitals.ts` | Triage and vital signs endpoints |
| **Create** | `backend/src/routes/queue.ts` | Live waiting queue and token dispatch endpoints |
| **Create** | `backend/src/routes/appointments.ts` | Appointment scheduling endpoints |
| **Create** | `backend/src/routes/consultations.ts` | Clinical notes and diagnosis endpoints |
| **Create** | `backend/src/routes/prescriptions.ts` | Prescription generation and PDF print endpoints |
| **Create** | `backend/src/routes/billing.ts` | Invoice creation, payment settlement, and POS endpoints |
| **Create** | `backend/src/routes/reports.ts` | Clinical, financial, and operational reports endpoints |
| **Modify** | `backend/src/app.ts` | Mount all new clinical routes |

### Frontend Admin Panel Files

| Action | Path | Description |
|---|---|---|
| **Create** | `admin-panel/components/Reception/` | Reception triage modal, vitals capture, and token slip |
| **Create** | `admin-panel/components/Patients/` | Patient directory, filterable table, and 360° EHR profile |
| **Modify** | `admin-panel/app/[role]/patients/page.tsx` | Wire live queue desk and patient directory |
| **Create** | `admin-panel/components/Appointments/` | Interactive booking calendar and slot manager |
| **Modify** | `admin-panel/app/[role]/appointments/page.tsx` | Wire appointment calendar and check-in flow |
| **Create** | `admin-panel/components/Consultation/` | Split-screen clinical workspace and drug formulary builder |
| **Create** | `admin-panel/components/Prescriptions/` | Prescription list, history, and printable A4/A5 letterhead |
| **Modify** | `admin-panel/app/[role]/prescriptions/page.tsx` | Wire prescriptions hub |
| **Create** | `admin-panel/components/Billing/` | Pending billing queue, invoice builder, and POS cashier |
| **Modify** | `admin-panel/app/[role]/billing/page.tsx` | Wire billing POS and receipt generator |
| **Create** | `admin-panel/components/Reports/` | Daily cash, doctor productivity, and wait time reports |
| **Modify** | `admin-panel/app/[role]/reports/page.tsx` | Wire clinical and financial reports suite |
| **Modify** | `admin-panel/app/[role]/dashboard/page.tsx` | Dynamic role-based dashboard rendering (Doctor vs Receptionist vs Admin) |
