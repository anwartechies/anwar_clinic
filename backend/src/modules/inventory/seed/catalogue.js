// Demo seed data — illustrative clinic records for testing, not real patients or prices.

const suppliers = [
  { key: 'medline', code: 'MD', name: 'Medline Distributors', city: 'Patna', categories: 'Medicines & consumables', contactName: 'Arvind Sahu', phone: '+91 94310 22018', email: 'orders@medline-patna.in', onTimePct: 96, fillRatePct: 98, leadDays: 2.1 },
  { key: 'bihar', code: 'BP', name: 'Bihar Pharma Agencies', city: 'Patna', categories: 'Medicines', contactName: 'Manoj Gupta', phone: '+91 93340 55127', email: 'sales@biharpharma.in', onTimePct: 88, fillRatePct: 94, leadDays: 2.8 },
  { key: 'regen', code: 'RL', name: 'Regen Lab India', city: 'Mumbai', categories: 'PRP kits · cold chain', contactName: 'Farhan Shaikh', phone: '+91 98200 41736', email: 'india@regenlab-demo.in', onTimePct: 92, fillRatePct: 97, leadDays: 4, coldChain: true },
  { key: 'shree', code: 'SH', name: 'Shree Healthcare', city: 'Muzaffarpur', categories: 'PPE', contactName: 'Deepak Thakur', phone: '+91 94701 38820', email: 'shreehealthcare@demo.in', onTimePct: 82, fillRatePct: 90, leadDays: 3 },
  { key: 'surgimax', code: 'SS', name: 'Surgimax Supplies', city: 'Kolkata', categories: 'Instruments', contactName: 'Subhajit Roy', phone: '+91 98310 66402', email: 'orders@surgimax-demo.in', onTimePct: 71, fillRatePct: 85, leadDays: 5 },
  { key: 'apex', code: 'AM', name: 'Apex Medisurge', city: 'Patna', categories: 'GFC kits', contactName: 'Ritesh Anand', phone: '+91 91550 70219', email: 'apexmedisurge@demo.in', onTimePct: 90, fillRatePct: 95, leadDays: 2.5 },
];

// [sku, name, type, category, unit, packInfo, manufacturer, cost, sell, gst, min, reorder, rx, cold, location, supplier]
const products = [
  ['FIN-001', 'Finasteride 1 mg', 'medicine', 'Oral', 'strip', 'Strip of 10 tablets', 'Arogya Pharma', 28, 52, 12, 15, 50, true, false, 'Rack A1', 'bihar'],
  ['DUT-005', 'Dutasteride 0.5 mg', 'medicine', 'Oral', 'strip', 'Strip of 10 softgels', 'Medivance Labs', 96, 165, 12, 10, 30, true, false, 'Rack A1', 'bihar'],
  ['BIO-10K', 'Biotin 10,000 mcg', 'medicine', 'Supplement', 'bottle', 'Bottle of 30 tablets', 'NutriCore', 149, 299, 18, 10, 40, false, false, 'Rack A2', 'medline'],
  ['HRV-060', 'Hair vitamin complex', 'medicine', 'Supplement', 'bottle', 'Bottle of 60 tablets', 'NutriCore', 310, 520, 18, 8, 24, false, false, 'Rack A2', 'medline'],
  ['PAN-040', 'Pantoprazole 40 mg', 'medicine', 'Oral', 'strip', 'Strip of 10 tablets', 'Sunrise Formulations', 38, 72, 12, 10, 40, true, false, 'Rack A3', 'bihar'],
  ['AMX-625', 'Amoxiclav 625', 'medicine', 'Antibiotic', 'strip', 'Strip of 6 tablets', 'Sunrise Formulations', 95, 180, 12, 8, 30, true, false, 'Rack A3', 'bihar'],
  ['CFX-500', 'Cefuroxime 500 mg', 'medicine', 'Antibiotic', 'strip', 'Strip of 10 tablets', 'Medivance Labs', 210, 360, 12, 6, 20, true, false, 'Rack A3', 'bihar'],
  ['PCM-650', 'Paracetamol 650 mg', 'medicine', 'Analgesic', 'strip', 'Strip of 15 tablets', 'Sunrise Formulations', 18, 32, 12, 20, 60, false, false, 'Rack A3', 'medline'],
  ['IBU-400', 'Ibuprofen 400 mg', 'medicine', 'Analgesic', 'strip', 'Strip of 10 tablets', 'Sunrise Formulations', 12, 25, 12, 20, 60, false, false, 'Rack A3', 'medline'],
  ['SRP-010', 'Serratiopeptidase 10 mg', 'medicine', 'Oral', 'strip', 'Strip of 10 tablets', 'Medivance Labs', 65, 120, 12, 10, 30, false, false, 'Rack A3', 'bihar'],
  ['CTZ-010', 'Cetirizine 10 mg', 'medicine', 'Oral', 'strip', 'Strip of 10 tablets', 'Sunrise Formulations', 9, 20, 12, 10, 40, false, false, 'Rack A3', 'medline'],

  ['MNX-005', 'Minoxidil 5% · 60 ml', 'medicine', 'Topical', 'bottle', '60 ml solution', 'Arogya Pharma', 455, 650, 12, 20, 48, false, false, 'Rack C1', 'medline'],
  ['MNX-002', 'Minoxidil 2% · 60 ml', 'medicine', 'Topical', 'bottle', '60 ml solution', 'Arogya Pharma', 320, 480, 12, 10, 24, false, false, 'Rack C1', 'medline'],
  ['KTZ-002', 'Ketoconazole 2% shampoo · 100 ml', 'medicine', 'Topical', 'bottle', '100 ml', 'Medivance Labs', 210, 345, 18, 8, 24, false, false, 'Rack C2', 'medline'],
  ['PDS-050', 'Peptide hair serum · 50 ml', 'medicine', 'Topical', 'bottle', '50 ml', 'NutriCore', 680, 1150, 18, 6, 18, false, false, 'Rack C2', 'medline'],
  ['MUP-002', 'Mupirocin 2% ointment · 5 g', 'medicine', 'Topical', 'tube', '5 g tube', 'Sunrise Formulations', 68, 115, 12, 8, 24, true, false, 'Rack C2', 'bihar'],
  ['POC-KIT', 'Post-op care kit', 'consumable', 'Post-op', 'kit', 'Shampoo, saline spray, neck pillow', 'Nexgen', 820, 1400, 18, 6, 20, false, false, 'Rack C3', 'medline'],
  ['SSP-100', 'Saline spray (post-op) · 100 ml', 'consumable', 'Post-op', 'bottle', '100 ml', 'Medivance Labs', 120, 220, 12, 10, 30, false, false, 'Rack C3', 'medline'],

  ['LID-230', 'Lidocaine 2% + Adrenaline · 30 ml', 'medicine', 'Injectable', 'vial', '30 ml vial', 'Sunrise Formulations', 380, 640, 12, 10, 30, true, false, 'Rack B1', 'medline'],
  ['LID-200', 'Lidocaine 2% plain · 30 ml', 'medicine', 'Injectable', 'vial', '30 ml vial', 'Sunrise Formulations', 210, 360, 12, 6, 20, true, false, 'Rack B1', 'medline'],
  ['BUP-005', 'Bupivacaine 0.5% · 20 ml', 'medicine', 'Injectable', 'vial', '20 ml vial', 'Medivance Labs', 145, 260, 12, 5, 15, true, false, 'Rack B1', 'medline'],
  ['KET-030', 'Ketorolac 30mg/ml inj', 'medicine', 'Injectable', 'vial', '1 ml vial', 'Sunrise Formulations', 52, 78, 12, 25, 40, true, false, 'Rack B2', 'medline'],
  ['TRI-040', 'Triamcinolone 40 mg inj', 'medicine', 'Injectable', 'vial', '1 ml vial', 'Medivance Labs', 265, 420, 12, 6, 20, true, false, 'Rack B2', 'bihar'],
  ['ADR-001', 'Adrenaline 1 mg amp', 'medicine', 'Injectable', 'amp', '1 ml ampoule', 'Sunrise Formulations', 22, 40, 12, 10, 30, true, false, 'Rack B2', 'medline'],
  ['TXA-500', 'Tranexamic acid 500 mg inj', 'medicine', 'Injectable', 'amp', '5 ml ampoule', 'Medivance Labs', 35, 60, 12, 10, 30, true, false, 'Rack B2', 'medline'],
  ['CFT-001', 'Ceftriaxone 1 g inj', 'medicine', 'Injectable', 'vial', '1 g vial', 'Sunrise Formulations', 52, 88, 12, 10, 40, true, false, 'Rack B3', 'medline'],
  ['DEX-004', 'Dexamethasone 4 mg inj', 'medicine', 'Injectable', 'amp', '1 ml ampoule', 'Sunrise Formulations', 14, 28, 12, 10, 40, true, false, 'Rack B3', 'medline'],
  ['OND-004', 'Ondansetron 4 mg inj', 'medicine', 'Injectable', 'amp', '2 ml ampoule', 'Medivance Labs', 12, 25, 12, 10, 30, true, false, 'Rack B3', 'medline'],

  ['NS-500', 'Saline 0.9% · 500 ml', 'consumable', 'IV fluid', 'bag', '500 ml bag', 'Medivance Labs', 70, 95, 5, 20, 60, false, false, 'Rack D2', 'medline'],
  ['RL-500', 'Ringer lactate · 500 ml', 'consumable', 'IV fluid', 'bag', '500 ml bag', 'Medivance Labs', 70, 98, 5, 10, 40, false, false, 'Rack D2', 'medline'],
  ['HTS-100', 'Hypothermosol · 100 ml', 'consumable', 'Graft storage', 'bottle', '100 ml bottle', 'BioLife Solutions', 2100, 2650, 12, 4, 10, false, true, 'OT fridge', 'medline'],

  ['PRP-K10', 'PRP kit (ACD-A tubes)', 'prp', 'PRP', 'kit', 'Kit of 2 ACD-A tubes', 'Regen Lab', 1560, 2200, 12, 15, 40, false, true, 'OT fridge', 'regen'],
  ['GFC-KIT', 'GFC kit', 'prp', 'GFC', 'kit', 'Growth-factor concentrate kit', 'Apex Medisurge', 1850, 3200, 12, 5, 10, false, false, 'Rack E1', 'apex'],
  ['ACD-010', 'ACD-A anticoagulant · 10 ml', 'prp', 'PRP', 'vial', '10 ml vial', 'Regen Lab', 120, 180, 12, 10, 30, false, true, 'OT fridge', 'regen'],

  ['SPH-08', 'FUE punch · sapphire 0.8', 'instrument', 'FUE', 'piece', 'Single-use punch', 'Surgimax', 290, 450, 18, 10, 50, false, false, 'Rack E2', 'surgimax'],
  ['SPH-09', 'FUE punch · sapphire 0.9', 'instrument', 'FUE', 'piece', 'Single-use punch', 'Surgimax', 290, 450, 18, 10, 50, false, false, 'Rack E2', 'surgimax'],
  ['SST-085', 'FUE punch · steel 0.85', 'instrument', 'FUE', 'piece', 'Single-use punch', 'Surgimax', 120, 210, 18, 10, 40, false, false, 'Rack E2', 'surgimax'],
  ['BLD-015', 'Surgical blade #15', 'instrument', 'Surgical', 'piece', 'Sterile blade', 'Surgimax', 6, 12, 18, 50, 200, false, false, 'Rack E1', 'surgimax'],
  ['SUT-050', 'Nylon suture 5-0', 'consumable', 'Surgical', 'piece', 'Suture with needle', 'Surgimax', 58, 95, 12, 20, 50, false, false, 'Rack E1', 'surgimax'],

  ['GZE-010', 'Sterile gauze 10×10', 'consumable', 'Dressing', 'pack', 'Pack of 10', 'Medivance Labs', 18, 30, 12, 40, 120, false, false, 'Rack D1', 'medline'],
  ['SYR-005', 'Syringe 5 ml', 'consumable', 'Disposables', 'piece', 'Sterile syringe', 'Medivance Labs', 4, 8, 12, 100, 300, false, false, 'Rack D1', 'medline'],
  ['SYR-001', 'Insulin syringe 1 ml', 'consumable', 'Disposables', 'piece', 'Sterile syringe', 'Medivance Labs', 5, 10, 12, 100, 300, false, false, 'Rack D1', 'medline'],
  ['DRS-POP', 'Post-op dressing set', 'consumable', 'Dressing', 'set', 'Sterile set', 'Medivance Labs', 85, 150, 12, 15, 40, false, false, 'Rack D1', 'medline'],

  ['GLV-07', 'Surgical gloves · size 7', 'ppe', 'Gloves', 'pair', 'Sterile pair', 'Shree Healthcare', 59.5, 85, 12, 50, 200, false, false, 'Rack F1', 'shree'],
  ['GLV-65', 'Surgical gloves · size 6.5', 'ppe', 'Gloves', 'pair', 'Sterile pair', 'Shree Healthcare', 59.5, 85, 12, 50, 200, false, false, 'Rack F1', 'shree'],
  ['N95-001', 'N95 masks', 'ppe', 'Masks', 'piece', 'Single mask', 'Shree Healthcare', 42, 65, 12, 50, 200, false, false, 'Rack F2', 'shree'],
  ['GWN-001', 'Disposable OT gown', 'ppe', 'Gowns', 'piece', 'Sterile gown', 'Shree Healthcare', 95, 160, 12, 20, 60, false, false, 'Rack F2', 'shree'],
  ['CAP-001', 'Surgical cap', 'ppe', 'Caps', 'piece', 'Single cap', 'Shree Healthcare', 6, 12, 12, 50, 200, false, false, 'Rack F2', 'shree'],
];

// Hand-placed batches that drive the alert, FEFO and approval scenarios.
// [sku, batchNo, qty, expiryInDays, extra]
const featuredBatches = [
  ['FIN-001', 'FN-2407', 12, 64, { costPrice: 27.5, receivedDaysAgo: 118, supplier: 'bihar', receivedQty: 30 }],
  ['FIN-001', 'FN-2409', 14, 154, { costPrice: 28 }],
  ['FIN-001', 'FN-2410', 10, 307, { costPrice: 28.4 }],
  ['FIN-001', 'FN-2402', 4, 100, { status: 'quarantined', quarantineReason: 'Packaging damage on receipt · blocked from dispensing' }],
  ['MNX-005', 'MX-2408', 25, 118],
  ['MNX-005', 'MX-2410', 24, 335],
  ['LID-230', 'LD-2306', 2, -3],
  ['LID-230', 'LD-2310', 4, 6],
  ['LID-230', 'LD-2407', 23, 210],
  ['KET-030', 'KT-2312', 24, 236],
  ['CFT-001', 'CF-2311', 5, 3],
  ['CFT-001', 'CF-2402', 31, 420],
  ['DEX-004', 'DX-2309', 3, 2],
  ['DEX-004', 'DX-2311', 40, 300],
  ['BUP-005', 'BP-2309', 0, 200],
  ['TRI-040', 'TA-2201', 12, -7],
  ['TRI-040', 'TA-2305', 8, 240],
  ['NS-500', 'NS-2408', 44, 570],
  ['RL-500', 'RL-2208', 6, -13],
  ['RL-500', 'RL-2405', 30, 400],
  ['AMX-625', 'AC-2204', 2, -28],
  ['AMX-625', 'AC-2402', 18, 300],
  ['HTS-100', 'HT-2409', 6, 150],
  ['HTS-100', 'HT-2312', 1, 90, { status: 'quarantined', quarantineReason: 'Temperature excursion (11 °C) on arrival' }],
  ['PRP-K10', 'PR-2406', 8, 12],
  ['GFC-KIT', 'GF-2305', 2, 4],
  ['GFC-KIT', 'GF-2402', 3, 160],
  ['BIO-10K', 'BT-2405', 4, 19],
  ['BIO-10K', 'BT-2409', 20, 300],
  ['PAN-040', 'PN-2402', 6, 27],
  ['PAN-040', 'PN-2406', 30, 400],
  ['N95-001', 'N9-2405', 22, 700],
  ['GLV-07', 'GL-2409', 94, 900],
  ['KTZ-002', 'KZ-2403', 5, 45],
  ['SRP-010', 'SR-2402', 12, 52],
  ['OND-004', 'ON-2401', 15, 75],
];

const staff = [
  { key: 'nilesh', name: 'Dr. Nilesh Kumar', email: 'nilesh@nexgenhair.in', phone: '+91 98765 43521', role: 'super_admin', title: 'Owner', avatarBg: '#0A1633', avatarFg: '#FFFFFF' },
  { key: 'ankita', name: 'Dr. Ankita Mishra', email: 'ankita@nexgenhair.in', phone: '+91 98350 11224', role: 'clinician', title: 'Prescriber', avatarBg: '#FFE8E2', avatarFg: '#C93216' },
  { key: 'rahul', name: 'Rahul Verma', email: 'rahul@nexgenhair.in', phone: '+91 99310 22871', role: 'inventory_manager', avatarBg: '#EEE8FF', avatarFg: '#5530D9' },
  { key: 'priya', name: 'Priya Sinha', email: 'priya@nexgenhair.in', phone: '+91 70040 55219', role: 'dispensing', avatarBg: '#DDF7EE', avatarFg: '#03785B' },
  { key: 'aman', name: 'Aman Raj', email: 'aman@nexgenhair.in', phone: '+91 62030 44718', role: 'dispensing', avatarBg: '#E7EBFF', avatarFg: '#1B34C4' },
  { key: 'neha', name: 'Neha Kumari', email: 'neha@nexgenhair.in', phone: '+91 79790 33605', role: 'billing', avatarBg: '#FFF2D4', avatarFg: '#8E5A00' },
  { key: 'sunil', name: 'Sunil Paswan', email: 'sunil@nexgenhair.in', phone: '+91 91220 87134', role: 'dispensing', avatarBg: '#EEF1F7', avatarFg: '#3E4A6B' },
  { key: 'ritika', name: 'Ritika Singh', email: 'ritika@nexgenhair.in', phone: '+91 70044 18562', role: 'billing', status: 'invited', avatarBg: '#FFFFFF', avatarFg: '#8E5A00' },
  { key: 'sanjay', name: 'Sanjay Yadav', email: 'sanjay@nexgenhair.in', phone: '+91 88730 19046', role: 'dispensing', status: 'inactive', avatarBg: '#EEF1F7', avatarFg: '#3E4A6B' },
];

const featuredPatients = [
  { key: 'rohit', name: 'Rohit Srivastava', phone: '+91 97080 11234', gender: 'M', age: 34 },
  { key: 'ankit', name: 'Ankit Kumar', phone: '+91 96310 55871', gender: 'M', age: 29 },
  { key: 'sneha', name: 'Sneha Mishra', phone: '+91 89870 22145', gender: 'F', age: 31 },
  { key: 'vikas', name: 'Vikas Prasad', phone: '+91 70330 98821', gender: 'M', age: 41 },
  { key: 'pooja', name: 'Pooja Jha', phone: '+91 99055 41207', gender: 'F', age: 27 },
  { key: 'manish', name: 'Manish Anand', phone: '+91 94304 77612', gender: 'M', age: 38 },
];

const firstNames = ['Aditya', 'Rakesh', 'Sanjeev', 'Kunal', 'Abhishek', 'Ravi', 'Saurabh', 'Nitin', 'Amit', 'Rajeev', 'Prakash', 'Gaurav', 'Vivek', 'Shubham', 'Deepak', 'Kavita', 'Anjali', 'Priyanka', 'Shalini', 'Nisha', 'Rupesh', 'Harsh', 'Mohit', 'Tarun', 'Alok', 'Pankaj', 'Ashish', 'Rohan', 'Varun', 'Sachin'];
const lastNames = ['Sinha', 'Kumar', 'Singh', 'Jha', 'Prasad', 'Mishra', 'Pandey', 'Verma', 'Ranjan', 'Choudhary', 'Thakur', 'Gupta', 'Yadav', 'Srivastava', 'Tiwari'];

module.exports = { suppliers, products, featuredBatches, staff, featuredPatients, firstNames, lastNames };
