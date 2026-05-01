import { CLINIC, BRANCHES } from './clinicMeta';
import {
  SERVICE_RATES,
  SLOT_TIMES,
  dentistDisplaySpecialty,
  serviceCategoriesForDentist,
} from './serviceCatalog';
import { addDaysISODate, todayISODate } from '../utils/format';
import { deriveStockStatus } from '../utils/inventoryLevels';
import { isSlotAllowedForDentistBranch } from './dentistBranchAvailability';

const today = todayISODate();

function pick(arr, i) {
  return arr[Math.abs(i) % arr.length];
}

const PATIENTS = [
  {
    id: 'P-001',
    fullName: 'Logyn Elkammah',
    nationalId: '29801011234567',
    dob: '1998-01-15',
    gender: 'Female',
    phone: '0100 223 4455',
    email: 'yasmine.elsherif@email.com',
    address: '12 Nile Corniche, Giza',
    bloodType: 'A+',
    allergies: 'Penicillin (moderate)',
    chronicConditions: 'None',
    emergencyContact: { name: 'Omar El-Sherif', relation: 'Spouse', phone: '0100 998 7766' },
    preferredBranchId: 'BR-DOKKI',
    medicalAttachment: null,
    notes: 'Primary demo portal account',
  },
  {
    id: 'P-002',
    fullName: 'Karim Lotfy',
    nationalId: '28506159876543',
    dob: '1985-06-20',
    gender: 'Male',
    phone: '0111 554 3322',
    email: 'karim.lotfy@email.com',
    address: '3 Dokki St., Giza',
    bloodType: 'O-',
    allergies: 'Latex',
    chronicConditions: 'Controlled hypertension',
    emergencyContact: { name: 'Dina Lotfy', relation: 'Sister', phone: '0155 443 2211' },
    notes: '',
  },
  {
    id: 'P-003',
    fullName: 'Nour Hamed',
    nationalId: '30112039871234',
    dob: '2001-12-03',
    gender: 'Female',
    phone: '0122 887 6655',
    email: 'nour.hamed@email.com',
    address: '7 Agouza, Cairo',
    bloodType: 'B+',
    allergies: 'None known',
    chronicConditions: 'Asthma (mild)',
    emergencyContact: { name: 'Hamed Mostafa', relation: 'Father', phone: '0122 112 3344' },
    notes: '',
  },
  {
    id: 'P-004',
    fullName: 'Omar Selim',
    nationalId: '29203059871290',
    dob: '1992-03-05',
    gender: 'Male',
    phone: '0109 221 3344',
    email: 'omar.selim@email.com',
    address: 'Sheikh Zayed, District 11',
    bloodType: 'AB+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Rania Selim', relation: 'Wife', phone: '0109 221 3345' },
    notes: 'Zayed regular patient',
  },
  {
    id: 'P-005',
    fullName: 'Farida Mansour',
    nationalId: '27708119812345',
    dob: '1977-08-11',
    gender: 'Female',
    phone: '0127 556 7788',
    email: 'farida.mansour@email.com',
    address: 'Dokki, Giza',
    bloodType: 'A-',
    allergies: 'Sulfa drugs',
    chronicConditions: 'Type 2 diabetes (controlled)',
    emergencyContact: { name: 'Mansour Ibrahim', relation: 'Husband', phone: '0127 556 7789' },
    notes: '',
  },
  {
    id: 'P-006',
    fullName: 'Tarek Anwar',
    nationalId: '28812039871231',
    dob: '1988-12-03',
    gender: 'Male',
    phone: '0110 445 6677',
    email: 'tarek.anwar@email.com',
    address: 'Mohandessin',
    bloodType: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Salma Anwar', relation: 'Sister', phone: '0110 445 6678' },
    notes: '',
  },
  {
    id: 'P-007',
    fullName: 'Mariam Khaled',
    nationalId: '29905051234567',
    dob: '1999-05-05',
    gender: 'Female',
    phone: '0155 332 1100',
    email: 'mariam.khaled@email.com',
    address: '6th October',
    bloodType: 'O+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Khaled Fathy', relation: 'Father', phone: '0155 332 1101' },
    notes: 'Ortho patient',
  },
  {
    id: 'P-008',
    fullName: 'Hassan El-Badry',
    nationalId: '27104019876543',
    dob: '1971-04-01',
    gender: 'Male',
    phone: '0100 778 9900',
    email: 'hassan.elbadry@email.com',
    address: 'Zamalek',
    bloodType: 'A+',
    allergies: 'None',
    chronicConditions: 'Dyslipidemia',
    emergencyContact: { name: 'Noha El-Badry', relation: 'Wife', phone: '0100 778 9901' },
    notes: '',
  },
  {
    id: 'P-009',
    fullName: 'Salma Dawoud',
    nationalId: '30411019871234',
    dob: '2004-11-01',
    gender: 'Female',
    phone: '0122 889 0011',
    email: 'salma.dawoud@email.com',
    address: 'Sheikh Zayed',
    bloodType: 'B-',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Dawoud Fathy', relation: 'Father', phone: '0122 889 0012' },
    notes: '',
  },
  {
    id: 'P-010',
    fullName: 'Youssef Gamal',
    nationalId: '29506069871234',
    dob: '1995-06-06',
    gender: 'Male',
    phone: '0105 667 8899',
    email: 'youssef.gamal@email.com',
    address: 'Dokki',
    bloodType: 'O+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Gamal Saad', relation: 'Father', phone: '0105 667 8898' },
    notes: '',
  },
  {
    id: 'P-011',
    fullName: 'Reem Fathy',
    nationalId: '29109099871234',
    dob: '1991-09-09',
    gender: 'Female',
    phone: '0111 223 4455',
    email: 'reem.fathy@email.com',
    address: 'New Cairo',
    bloodType: 'A+',
    allergies: 'Ibuprofen (mild rash)',
    chronicConditions: 'None',
    emergencyContact: { name: 'Fathy Ibrahim', relation: 'Brother', phone: '0111 223 4456' },
    notes: '',
  },
  {
    id: 'P-012',
    fullName: 'Ahmed Nour',
    nationalId: '28602119871234',
    dob: '1986-02-11',
    gender: 'Male',
    phone: '0120 334 5566',
    email: 'ahmed.nour@email.com',
    address: 'Haram',
    bloodType: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Nour Ahmed', relation: 'Mother', phone: '0120 334 5567' },
    notes: '',
  },
  {
    id: 'P-013',
    fullName: 'Dina Mostafa',
    nationalId: '30003039871234',
    dob: '2000-03-03',
    gender: 'Female',
    phone: '0108 998 7766',
    email: 'dina.mostafa@email.com',
    address: 'Sheikh Zayed',
    bloodType: 'O-',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: { name: 'Mostafa Kamel', relation: 'Father', phone: '0108 998 7767' },
    notes: '',
  },
  {
    id: 'P-014',
    fullName: 'Khaled Ramy',
    nationalId: '28307159871234',
    dob: '1983-07-15',
    gender: 'Male',
    phone: '0155 667 8899',
    email: 'khaled.ramy@email.com',
    address: 'Agouza',
    bloodType: 'A+',
    allergies: 'None',
    chronicConditions: 'GERD',
    emergencyContact: { name: 'Ramy Khaled', relation: 'Son', phone: '0155 667 8898' },
    notes: '',
  },
];

const DENTISTS = [
  {
    id: 'D-001',
    fullName: 'Dr Youssef Hany',
    specialty: 'Endodontist',
    serviceCategories: ['endodontics', 'emergency'],
    branchIds: ['BR-DOKKI', 'BR-ZAYED'],
    phone: '0100 334 5566',
    email: 'youssef.hany@claritydental.eg',
    scheduleSummary: 'Dokki Sun/Tue/Thu 10:00–14:00 · Zayed Mon/Wed 16:00–20:00',
  },
  {
    id: 'D-002',
    fullName: 'Dr Amr Elkammah',
    specialty: 'Prosthodontist',
    serviceCategories: ['prosthodontics', 'general'],
    branchIds: ['BR-DOKKI', 'BR-ZAYED'],
    phone: '0127 937 9396',
    email: 'amr.elkammah@claritydental.eg',
    scheduleSummary: 'Dokki Mon/Wed 11:00–15:00 · Zayed Tue/Sat 17:00–21:00',
  },
  {
    id: 'D-003',
    fullName: 'Dr Ahmed Samir',
    specialty: 'Oral and Maxillofacial Surgeon',
    serviceCategories: ['implants', 'general', 'emergency'],
    branchIds: ['BR-DOKKI', 'BR-ZAYED'],
    phone: '0100 221 3344',
    email: 'ahmed.samir@claritydental.eg',
    scheduleSummary: 'Dokki Sat/Mon 09:00–13:00 · Zayed Thu 15:00–19:00',
  },
];

const ASSISTANTS = [
  {
    id: 'A-001',
    fullName: 'Layla Ashraf',
    branchId: 'BR-DOKKI',
    role: 'Dental Assistant',
    phone: '0100 556 7788',
    email: 'layla.ashraf@claritydental.eg',
    assignedFunctions: ['Front desk', 'Chairside', 'Billing', 'Inventory'],
  },
  {
    id: 'A-002',
    fullName: 'Malak Sherif',
    branchId: 'BR-ZAYED',
    role: 'Dental Assistant',
    phone: '0100 667 8899',
    email: 'malak.sherif@claritydental.eg',
    assignedFunctions: ['Sterilization', 'Chairside', 'PO receiving'],
  },
];

const SUPPLIERS = [
  { id: 'S-01', name: 'Cairo Dental Supplies Co.', contact: 'orders@cds-eg.com', phone: '0223344556' },
  { id: 'S-02', name: 'Nile Orthodontics Trading', contact: 'sales@nilortho.eg', phone: '0229988770' },
  { id: 'S-03', name: 'Alex Sterilization Products', contact: 'info@alexsterile.eg', phone: '0345522110' },
  { id: 'S-04', name: 'Delta Endodontic Materials', contact: 'supply@endodelta.eg', phone: '0502233445' },
  { id: 'S-05', name: 'Premium Composite Egypt', contact: 'logistics@premcomp.eg', phone: '0227766554' },
];

const INV_BLUEPRINT = [
  { name: 'Nitrile examination gloves (L, box of 100)', sku: 'GLV-N-L', unit: 'box', qty: 48, reorder: 22, supplierId: 'S-01' },
  { name: 'Surgical face masks (ASTM Level 3, box)', sku: 'MSK-L3', unit: 'box', qty: 36, reorder: 15, supplierId: 'S-01' },
  { name: 'Cotton rolls sterile (pack)', sku: 'CTN-RLL', unit: 'pack', qty: 120, reorder: 40, supplierId: 'S-01' },
  { name: 'Gauze sponges 10×10 sterile', sku: 'GZ-1010', unit: 'pack', qty: 55, reorder: 25, supplierId: 'S-01' },
  { name: 'Saliva ejectors (bag 100)', sku: 'SAL-EJ', unit: 'bag', qty: 28, reorder: 12, supplierId: 'S-01' },
  { name: 'Disposable cups 180ml', sku: 'CUP-180', unit: 'sleeve', qty: 40, reorder: 18, supplierId: 'S-01' },
  { name: 'Patient bibs (roll)', sku: 'BIB-RL', unit: 'roll', qty: 14, reorder: 6, supplierId: 'S-01' },
  { name: 'Disposable syringes 5ml', sku: 'SYR-5', unit: 'box', qty: 22, reorder: 10, supplierId: 'S-01' },
  { name: 'Lidocaine 2% cartridges', sku: 'LIDO-2', unit: 'cartridge', qty: 8, reorder: 20, supplierId: 'S-04' },
  { name: 'Disposable needles 27G short', sku: 'NDL-27S', unit: 'box', qty: 18, reorder: 10, supplierId: 'S-04' },
  { name: 'VPS impression material (heavy)', sku: 'IMP-VPS-H', unit: 'cart', qty: 6, reorder: 4, supplierId: 'S-05' },
  { name: 'Composite resin syringe A2', sku: 'CMP-A2', unit: 'syringe', qty: 14, reorder: 10, supplierId: 'S-05' },
  { name: 'Phosphoric acid etchant 37%', sku: 'ETCH-37', unit: 'bottle', qty: 9, reorder: 4, supplierId: 'S-05' },
  { name: 'Universal bonding agent (5ml)', sku: 'BOND-U5', unit: 'bottle', qty: 7, reorder: 4, supplierId: 'S-05' },
  { name: 'Temporary filling material (Cavit)', sku: 'TMP-CAV', unit: 'jar', qty: 11, reorder: 5, supplierId: 'S-05' },
  { name: 'NiTi rotary files (assorted)', sku: 'ENDO-NITI', unit: 'kit', qty: 5, reorder: 3, supplierId: 'S-04' },
  { name: 'Gutta percha points .06 taper', sku: 'GP-06', unit: 'box', qty: 12, reorder: 6, supplierId: 'S-04' },
  { name: 'Paper points #25', sku: 'PP-25', unit: 'box', qty: 10, reorder: 5, supplierId: 'S-04' },
  { name: 'Surface disinfectant concentrate 1L', sku: 'DIS-1L', unit: 'bottle', qty: 15, reorder: 6, supplierId: 'S-03' },
  { name: 'Sterilization pouches (200)', sku: 'STL-PCH', unit: 'box', qty: 9, reorder: 4, supplierId: 'S-03' },
  { name: 'Surgical suction tips sterile', sku: 'SUC-SURG', unit: 'bag', qty: 20, reorder: 10, supplierId: 'S-01' },
  { name: 'Fluoride varnish (single dose)', sku: 'FL-VAR', unit: 'unit', qty: 60, reorder: 25, supplierId: 'S-01' },
  { name: 'Prophylaxis paste coarse', sku: 'POL-C', unit: 'jar', qty: 8, reorder: 4, supplierId: 'S-01' },
  { name: 'Metal matrix bands kit', sku: 'MAT-M', unit: 'kit', qty: 6, reorder: 3, supplierId: 'S-05' },
  { name: 'Wooden wedges assorted', sku: 'WED-W', unit: 'box', qty: 14, reorder: 6, supplierId: 'S-05' },
  { name: 'Articulating paper (thin)', sku: 'ART-TH', unit: 'book', qty: 22, reorder: 8, supplierId: 'S-02' },
  { name: 'Extraction forceps #18', sku: 'FCP-18', unit: 'piece', qty: 4, reorder: 2, supplierId: 'S-01' },
  { name: 'Mouth mirrors #5 (handles)', sku: 'MIR-5', unit: 'piece', qty: 18, reorder: 8, supplierId: 'S-01' },
  { name: 'Dental explorers DE #11', sku: 'EXP-11', unit: 'piece', qty: 16, reorder: 8, supplierId: 'S-01' },
  { name: 'Periodontal curettes set', sku: 'CUR-PER', unit: 'set', qty: 5, reorder: 2, supplierId: 'S-01' },
  { name: 'High-speed handpiece (clinic spare)', sku: 'HP-HS', unit: 'unit', qty: 3, reorder: 2, supplierId: 'S-02' },
  { name: 'LED curing light portable', sku: 'CURE-LED', unit: 'unit', qty: 4, reorder: 2, supplierId: 'S-05' },
  { name: 'Endodontic motor with apex locator', sku: 'ENDO-MOT', unit: 'unit', qty: 2, reorder: 1, supplierId: 'S-04' },
  { name: 'Orthodontic pliers kit', sku: 'ORT-PLR', unit: 'kit', qty: 3, reorder: 2, supplierId: 'S-02' },
];

function injectPrimaryPatientPortalDemo({ today, appointments, visits, treatmentRecords, invoices, payments, accountsReceivable }) {
  const pid = 'P-001';
  const h0Date = '2025-11-05';
  const h1Date = '2026-03-10';
  const h2Date = '2026-01-15';
  const rct = SERVICE_RATES.find((s) => s.code === 'ENDO-RCT-P');
  const crown = SERVICE_RATES.find((s) => s.code === 'PRO-ZIR');
  const consult = SERVICE_RATES.find((s) => s.code === 'GEN-CHK');
  const extSimple = SERVICE_RATES.find((s) => s.code === 'GEN-EXT-S');

  appointments.push(
    {
      id: 'APT-LUJ-H0',
      branchId: 'BR-ZAYED',
      patientId: pid,
      dentistId: 'D-003',
      specialty: 'Oral Surgery',
      requestedServiceCode: extSimple?.code || null,
      requestedServiceLabel: extSimple?.label || 'Tooth extraction (simple)',
      date: h0Date,
      time: '09:30',
      status: 'Completed',
      notes: '',
      reminderStatus: 'Reminder Sent',
      createdBy: 'patient',
      ratingEligible: false,
    },
    {
      id: 'APT-LUJ-H1',
      branchId: 'BR-DOKKI',
      patientId: pid,
      dentistId: 'D-001',
      specialty: 'Endodontics',
      requestedServiceCode: rct?.code || null,
      requestedServiceLabel: rct?.label || 'Root canal therapy (posterior / molar)',
      date: h1Date,
      time: '10:00',
      status: 'Completed',
      notes: '',
      reminderStatus: 'Reminder Sent',
      createdBy: 'patient',
      ratingEligible: false,
    },
    {
      id: 'APT-LUJ-H2',
      branchId: 'BR-ZAYED',
      patientId: pid,
      dentistId: 'D-002',
      specialty: 'Prosthodontics',
      requestedServiceCode: crown?.code || null,
      requestedServiceLabel: crown?.label || 'Dental crown (zirconia)',
      date: h2Date,
      time: '14:30',
      status: 'Completed',
      notes: '',
      reminderStatus: 'Reminder Sent',
      createdBy: 'patient',
      ratingEligible: false,
    },
  );

  visits.push(
    {
      id: 'V-LUJ-H0',
      branchId: 'BR-ZAYED',
      patientId: pid,
      dentistId: 'D-003',
      appointmentId: 'APT-LUJ-H0',
      date: h0Date,
      chiefComplaint: 'Problem wisdom tooth',
      notes: 'Simple extraction · post-op instructions given.',
    },
    {
      id: 'V-LUJ-H1',
      branchId: 'BR-DOKKI',
      patientId: pid,
      dentistId: 'D-001',
      appointmentId: 'APT-LUJ-H1',
      date: h1Date,
      chiefComplaint: 'Severe tooth pain',
      notes: 'RCT completed · chart closed same day.',
    },
    {
      id: 'V-LUJ-H2',
      branchId: 'BR-ZAYED',
      patientId: pid,
      dentistId: 'D-002',
      appointmentId: 'APT-LUJ-H2',
      date: h2Date,
      chiefComplaint: 'Crown placement',
      notes: 'Definitive crown seated.',
    },
  );

  treatmentRecords.push(
    {
      id: 'TR-LUJ-H0',
      branchId: 'BR-ZAYED',
      patientId: pid,
      visitId: 'V-LUJ-H0',
      dentistId: 'D-003',
      date: h0Date,
      serviceCode: extSimple?.code || 'GEN-EXT-S',
      procedureType: extSimple?.label || 'Tooth extraction (simple)',
      diagnosis: 'Symptomatic irreversible pulpitis · non-restorable',
      details: 'Local anaesthesia · uncomplicated forceps extraction.',
      notes: '',
    },
    {
      id: 'TR-LUJ-H1',
      branchId: 'BR-DOKKI',
      patientId: pid,
      visitId: 'V-LUJ-H1',
      dentistId: 'D-001',
      date: h1Date,
      serviceCode: rct?.code || 'ENDO-RCT-P',
      procedureType: rct?.label || 'Root canal therapy (posterior / molar)',
      diagnosis: 'Irreversible pulpitis',
      details: 'Single-visit RCT with rubber dam.',
      notes: '',
    },
    {
      id: 'TR-LUJ-H2',
      branchId: 'BR-ZAYED',
      patientId: pid,
      visitId: 'V-LUJ-H2',
      dentistId: 'D-002',
      date: h2Date,
      serviceCode: crown?.code || 'PRO-ZIR',
      procedureType: crown?.label || 'Dental crown (zirconia)',
      diagnosis: 'Restoration of endodontically treated tooth',
      details: 'Zirconia crown cemented.',
      notes: '',
    },
  );

  const l1 = consult || SERVICE_RATES[0];
  const l2 = rct || SERVICE_RATES[0];
  const l3 = crown || SERVICE_RATES[0];
  const lex = extSimple || SERVICE_RATES[0];
  const amtH0 = lex.price;
  const amtH1 = l1.price + l2.price;
  const amtH2 = l3.price;
  const paidH2 = Math.round(amtH2 * 0.5);

  invoices.push(
    {
      id: 'INV-LUJ-H0',
      branchId: 'BR-ZAYED',
      dentistId: 'D-003',
      patientId: pid,
      treatmentRecordId: 'TR-LUJ-H0',
      appointmentId: 'APT-LUJ-H0',
      date: h0Date,
      visitPending: false,
      lines: [{ code: lex.code, label: lex.label, qty: 1, unitPrice: lex.price, priceMin: lex.priceMin, priceMax: lex.priceMax }],
      subtotal: amtH0,
      amount: amtH0,
      amountPaid: amtH0,
      status: 'Paid',
      dueDate: addDaysISODate(h0Date, 21),
    },
    {
      id: 'INV-LUJ-H1',
      branchId: 'BR-DOKKI',
      dentistId: 'D-001',
      patientId: pid,
      treatmentRecordId: 'TR-LUJ-H1',
      appointmentId: 'APT-LUJ-H1',
      date: h1Date,
      visitPending: false,
      lines: [
        { code: l1.code, label: l1.label, qty: 1, unitPrice: l1.price, priceMin: l1.priceMin, priceMax: l1.priceMax },
        { code: l2.code, label: l2.label, qty: 1, unitPrice: l2.price, priceMin: l2.priceMin, priceMax: l2.priceMax },
      ],
      subtotal: amtH1,
      amount: amtH1,
      amountPaid: amtH1,
      status: 'Paid',
      dueDate: addDaysISODate(h1Date, 21),
    },
    {
      id: 'INV-LUJ-H2',
      branchId: 'BR-ZAYED',
      dentistId: 'D-002',
      patientId: pid,
      treatmentRecordId: 'TR-LUJ-H2',
      appointmentId: 'APT-LUJ-H2',
      date: h2Date,
      visitPending: false,
      lines: [{ code: l3.code, label: l3.label, qty: 1, unitPrice: l3.price, priceMin: l3.priceMin, priceMax: l3.priceMax }],
      subtotal: amtH2,
      amount: amtH2,
      amountPaid: paidH2,
      status: 'Partially Paid',
      dueDate: addDaysISODate(h2Date, 21),
    },
  );

  const payH2a = Math.max(1, Math.round(paidH2 * 0.62));
  const payH2b = paidH2 - payH2a;
  payments.push(
    {
      id: 'PAY-LUJ-H0',
      branchId: 'BR-ZAYED',
      invoiceId: 'INV-LUJ-H0',
      patientId: pid,
      amount: amtH0,
      method: 'Cash',
      date: h0Date,
      recordedBy: 'A-002',
      status: 'Completed',
    },
    {
      id: 'PAY-LUJ-H1',
      branchId: 'BR-DOKKI',
      invoiceId: 'INV-LUJ-H1',
      patientId: pid,
      amount: amtH1,
      method: 'Card',
      date: h1Date,
      recordedBy: 'A-001',
      status: 'Completed',
    },
    {
      id: 'PAY-LUJ-H2A',
      branchId: 'BR-ZAYED',
      invoiceId: 'INV-LUJ-H2',
      patientId: pid,
      amount: payH2a,
      method: 'Instapay',
      date: h2Date,
      recordedBy: 'A-002',
      status: 'Completed',
    },
    {
      id: 'PAY-LUJ-H2B',
      branchId: 'BR-ZAYED',
      invoiceId: 'INV-LUJ-H2',
      patientId: pid,
      amount: payH2b,
      method: 'Card',
      date: addDaysISODate(h2Date, 6),
      recordedBy: 'A-002',
      status: 'Completed',
    },
  );

  accountsReceivable.push({
    id: 'AR-LUJ-DEMO',
    branchId: 'BR-ZAYED',
    invoiceId: 'INV-LUJ-H2',
    patientId: pid,
    outstanding: amtH2 - paidH2,
    dueDate: addDaysISODate(h2Date, 21),
    status: 'Partial',
  });

  let nextDate = addDaysISODate(today, 10);
  for (let i = 0; i < 56; i++) {
    const d = addDaysISODate(addDaysISODate(today, 10), i);
    if (isSlotAllowedForDentistBranch('D-001', 'BR-DOKKI', d, '11:00', DENTISTS)) {
      nextDate = d;
      break;
    }
  }
  const yh = DENTISTS.find((x) => x.id === 'D-001');
  appointments.push({
    id: 'APT-LUJ-NEXT',
    branchId: 'BR-DOKKI',
    patientId: pid,
    dentistId: 'D-001',
    specialty: dentistDisplaySpecialty(yh),
    requestedServiceCode: null,
    requestedServiceLabel: null,
    date: nextDate,
    time: '11:00',
    status: 'Scheduled',
    notes: '',
    reminderStatus: 'Pending',
    createdBy: 'patient',
    ratingEligible: false,
  });

  invoices.push({
    id: 'INV-LUJ-PEND',
    branchId: 'BR-DOKKI',
    dentistId: 'D-001',
    patientId: pid,
    treatmentRecordId: null,
    appointmentId: 'APT-LUJ-NEXT',
    date: today,
    visitPending: true,
    lines: [
      {
        code: 'TBD',
        label: 'Treatment to be finalized after your visit — fees follow clinical assessment.',
        qty: 1,
        unitPrice: 0,
      },
    ],
    subtotal: 0,
    amount: 0,
    amountPaid: 0,
    status: 'Pending',
    dueDate: nextDate,
  });
}

function buildInventory() {
  const out = [];
  BRANCHES.forEach((br) => {
    INV_BLUEPRINT.forEach((row, i) => {
      const reorder = row.reorder;
      const tier = (i + br.id.charCodeAt(2)) % 10;
      let qty;
      if (tier < 6) {
        qty = reorder * 2 + 10 + (i % 5);
      } else if (tier < 9) {
        qty = Math.max(1, reorder + Math.min(Math.ceil(reorder * 0.18), 8));
      } else {
        qty = Math.max(0, reorder - 2 - (i % 4));
      }
      out.push({
        id: `INV-${br.id === 'BR-DOKKI' ? 'DK' : 'ZY'}-${String(i + 1).padStart(2, '0')}`,
        branchId: br.id,
        supplierId: row.supplierId,
        name: row.name,
        sku: `${row.sku}-${br.shortName}`,
        unit: row.unit,
        quantity: qty,
        reorderLevel: reorder,
        status: deriveStockStatus(qty, reorder),
      });
    });
  });
  return out;
}

function buildAppointments() {
  const list = [];
  let seq = 3000;
  const statusWeights = (dayOff) => {
    if (dayOff < -14) return ['Completed', 'Completed', 'No Show', 'Cancelled', 'Rescheduled'];
    if (dayOff < -3) return ['Completed', 'Completed', 'Confirmed', 'Cancelled', 'Rescheduled'];
    if (dayOff < 0) return ['Completed', 'Checked In', 'Confirmed', 'In Progress', 'Rescheduled'];
    if (dayOff === 0) return ['Checked In', 'In Progress', 'Confirmed', 'Scheduled', 'Scheduled'];
    return ['Scheduled', 'Confirmed', 'Scheduled', 'Confirmed', 'Rescheduled'];
  };

  for (let dayOff = -20; dayOff <= 21; dayOff++) {
    const date = addDaysISODate(today, dayOff);
    SLOT_TIMES.forEach((time, ti) => {
      if ((dayOff + ti) % 4 === 0) return;
      const candidates = [];
      for (const dentist of DENTISTS) {
        for (const branchId of dentist.branchIds) {
          if (isSlotAllowedForDentistBranch(dentist.id, branchId, date, time, DENTISTS)) {
            candidates.push({ dentist, branchId });
          }
        }
      }
      if (candidates.length === 0) return;
      const { dentist, branchId } = candidates[Math.abs(dayOff * 31 + ti * 7) % candidates.length];
      const patient = pick(PATIENTS, dayOff * 5 + ti * 2);
      const pool = statusWeights(dayOff);
      const status = pick(pool, dayOff * 11 + ti);
      const cats = serviceCategoriesForDentist(dentist);
      const svcPool = SERVICE_RATES.filter((r) => cats.includes(r.categoryId));
      const svc = pick(svcPool.length ? svcPool : SERVICE_RATES, dayOff + ti * 3);
      list.push({
        id: `APT-${seq++}`,
        branchId,
        patientId: patient.id,
        dentistId: dentist.id,
        specialty: dentistDisplaySpecialty(dentist),
        requestedServiceCode: svc.code,
        requestedServiceLabel: svc.label,
        date,
        time,
        status,
        notes:
          status === 'Completed'
            ? 'Visit closed · chart updated.'
            : status === 'Checked In'
              ? 'Front desk check-in complete.'
              : status === 'In Progress'
                ? 'Chairside procedure in progress.'
                : '',
        reminderStatus: dayOff >= 0 && status === 'Scheduled' ? (ti % 2 ? 'Reminder Sent' : 'Pending') : 'Reminder Sent',
        createdBy: ti % 4 === 0 ? 'patient' : 'assistant',
      });
    });
  }
  return list;
}

export function createInitialState() {
  const patients = PATIENTS.map((p, i) => ({
    ...p,
    registeredAt: addDaysISODate(today, -(i % 60) - (i % 7) * 3),
  }));
  const dentists = DENTISTS;
  const assistants = ASSISTANTS;
  const branches = BRANCHES;
  const inventory = buildInventory();
  const appointments = buildAppointments();

  const completedAppts = appointments.filter((a) => a.status === 'Completed').slice(0, 42);
  const visits = [];
  const treatmentRecords = [];
  const prescriptions = [];
  let vSeq = 8000;
  let trSeq = 9000;
  let rxSeq = 4000;

  completedAppts.forEach((ap, idx) => {
    const vid = `V-${vSeq++}`;
    visits.push({
      id: vid,
      branchId: ap.branchId,
      patientId: ap.patientId,
      dentistId: ap.dentistId,
      appointmentId: ap.id,
      date: ap.date,
      chiefComplaint: pick(
        ['Routine recall', 'Sensitivity', 'Ortho wire discomfort', 'Third molar pain', 'Bleeding gums', 'Crown cementation review'],
        idx,
      ),
      notes: 'Clinical notes documented · informed consent on file.',
    });
    const tid = `TR-${trSeq++}`;
    const svc = pick(SERVICE_RATES, idx);
    treatmentRecords.push({
      id: tid,
      branchId: ap.branchId,
      patientId: ap.patientId,
      visitId: vid,
      dentistId: ap.dentistId,
      date: ap.date,
      serviceCode: svc.code,
      procedureType: svc.label,
      diagnosis: pick(['Caries limited', 'Healthy maintenance', 'Pericoronitis', 'Malocclusion', 'Pulpitis'], idx),
      details: `Delivered at ${ap.branchId} · EHR synced.`,
      notes: '',
    });
    if (idx % 2 === 0) {
      prescriptions.push({
        id: `RX-${rxSeq++}`,
        branchId: ap.branchId,
        patientId: ap.patientId,
        treatmentRecordId: tid,
        dentistId: ap.dentistId,
        medicine: pick(['Amoxicillin 500 mg', 'Ibuprofen 400 mg', 'Chlorhexidine rinse 0.12%', 'Paracetamol 500 mg'], idx),
        dosage: pick(['1 cap TID', '1 tab QID PRN', '15 ml rinse BID', '1–2 tabs PRN'], idx),
        duration: pick(['5 days', '7 days', '10 days', '3 days'], idx),
        instructions: 'Take with food unless directed otherwise.',
        date: ap.date,
      });
    }
  });

  const medicalRecords = patients.map((p, i) => ({
    patientId: p.id,
    summary: `${p.allergies === 'None' || p.allergies === 'None known' ? 'No major allergies on file' : `Allergies: ${p.allergies}`}. ${p.chronicConditions === 'None' ? '' : p.chronicConditions}`,
    lastUpdated: addDaysISODate(today, -(i % 40)),
  }));

  const invoices = [];
  const payments = [];
  const accountsReceivable = [];
  let invSeq = 5000;
  let paySeq = 7000;
  let arSeq = 6000;

  treatmentRecords.forEach((tr, i) => {
    const lines = [];
    const main = SERVICE_RATES.find((s) => s.code === tr.serviceCode) || pick(SERVICE_RATES, i);
    lines.push({
      code: main.code,
      label: main.label,
      qty: 1,
      unitPrice: main.price,
      priceMin: main.priceMin,
      priceMax: main.priceMax,
    });
    if (i % 5 === 0) {
      const add = pick(SERVICE_RATES, i + 3);
      if (add.code !== main.code)
        lines.push({
          code: add.code,
          label: add.label,
          qty: 1,
          unitPrice: add.price,
          priceMin: add.priceMin,
          priceMax: add.priceMax,
        });
    }
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    const amount = subtotal;
    let amountPaid = 0;
    let status = 'Unpaid';
    if (i % 7 === 0) {
      amountPaid = amount;
      status = 'Paid';
    } else if (i % 7 === 1 || i % 7 === 2) {
      amountPaid = Math.round(amount * 0.45);
      status = 'Partially Paid';
    } else if (i % 7 === 3) {
      amountPaid = 0;
      status = 'Unpaid';
    } else {
      amountPaid = amount;
      status = 'Paid';
    }
    const invId = `INV-${invSeq++}`;
    const invoiceDue = addDaysISODate(tr.date, 21);
    invoices.push({
      id: invId,
      branchId: tr.branchId,
      dentistId: tr.dentistId,
      patientId: tr.patientId,
      treatmentRecordId: tr.id,
      date: tr.date,
      lines,
      subtotal,
      amount,
      amountPaid,
      status,
      dueDate: invoiceDue,
    });
    const partialSplit = i % 7 === 1 || i % 7 === 2;
    if (amountPaid > 0) {
      if (partialSplit && amountPaid < amount) {
        const first = Math.max(1, Math.round(amountPaid * 0.58));
        const second = amountPaid - first;
        payments.push({
          id: `PAY-${paySeq++}`,
          branchId: tr.branchId,
          invoiceId: invId,
          patientId: tr.patientId,
          amount: first,
          method: pick(['Card', 'Cash', 'Instapay'], i),
          date: tr.date,
          recordedBy: pick(['A-001', 'A-002'], i),
          status: 'Completed',
        });
        payments.push({
          id: `PAY-${paySeq++}`,
          branchId: tr.branchId,
          invoiceId: invId,
          patientId: tr.patientId,
          amount: second,
          method: pick(['Instapay', 'Bank transfer', 'Cash'], i + 1),
          date: addDaysISODate(tr.date, 5),
          recordedBy: pick(['A-001', 'A-002', 'PATIENT-PORTAL'], i + 2),
          status: 'Completed',
        });
      } else {
        payments.push({
          id: `PAY-${paySeq++}`,
          branchId: tr.branchId,
          invoiceId: invId,
          patientId: tr.patientId,
          amount: amountPaid,
          method: pick(['Card', 'Cash', 'Instapay', 'Bank transfer'], i),
          date: tr.date,
          recordedBy: pick(['A-001', 'A-002', 'PATIENT-PORTAL'], i),
          status: 'Completed',
        });
      }
    }
    if (amount > amountPaid) {
      accountsReceivable.push({
        id: `AR-${arSeq++}`,
        branchId: tr.branchId,
        invoiceId: invId,
        patientId: tr.patientId,
        outstanding: amount - amountPaid,
        dueDate: invoiceDue,
        status: amountPaid > 0 ? 'Partial' : 'Current',
      });
    }
  });

  injectPrimaryPatientPortalDemo({
    today,
    appointments,
    visits,
    treatmentRecords,
    invoices,
    payments,
    accountsReceivable,
  });

  const supplyUsage = [];
  let su = 1;
  for (let i = 0; i < 35; i++) {
    const item = pick(inventory, i);
    supplyUsage.push({
      id: `SU-${String(su++).padStart(3, '0')}`,
      branchId: item.branchId,
      inventoryItemId: item.id,
      quantity: 1 + (i % 3),
      visitId: pick(visits, i).id,
      treatmentRecordId: pick(treatmentRecords, i).id,
      date: addDaysISODate(today, -(i % 25)),
      recordedBy: pick(['A-001', 'A-002'], i),
    });
  }

  const purchaseOrders = [
    {
      id: 'PO-601',
      branchId: 'BR-DOKKI',
      supplierId: 'S-01',
      status: 'Pending Approval',
      createdDate: addDaysISODate(today, -4),
      items: [
        { inventoryItemId: inventory.find((x) => x.name.includes('Lidocaine'))?.id, name: 'Lidocaine 2% cartridges', qty: 120, estUnitPrice: 28 },
        { inventoryItemId: inventory.find((x) => x.name.includes('Nitrile'))?.id, name: 'Nitrile gloves', qty: 40, estUnitPrice: 195 },
      ],
      estTotal: 120 * 28 + 40 * 195,
      notes: 'Dokki surgery week restock.',
    },
    {
      id: 'PO-602',
      branchId: 'BR-ZAYED',
      supplierId: 'S-02',
      status: 'Pending Approval',
      createdDate: addDaysISODate(today, -2),
      items: [{ inventoryItemId: inventory.find((x) => x.branchId === 'BR-ZAYED' && x.name.includes('Composite'))?.id, name: 'Composite A2', qty: 24, estUnitPrice: 520 }],
      estTotal: 24 * 520,
      notes: 'Ortho bay consumables.',
    },
    {
      id: 'PO-603',
      branchId: 'BR-DOKKI',
      supplierId: 'S-03',
      status: 'Approved',
      createdDate: addDaysISODate(today, -18),
      items: [{ inventoryItemId: inventory.find((x) => x.name.includes('Sterilization'))?.id, name: 'Sterilization pouches', qty: 15, estUnitPrice: 340 }],
      estTotal: 15 * 340,
      notes: '',
    },
    {
      id: 'PO-604',
      branchId: 'BR-ZAYED',
      supplierId: 'S-04',
      status: 'Received',
      createdDate: addDaysISODate(today, -30),
      items: [{ inventoryItemId: inventory.find((x) => x.branchId === 'BR-ZAYED' && x.name.includes('Gutta'))?.id, name: 'GP points', qty: 20, estUnitPrice: 180 }],
      estTotal: 20 * 180,
      notes: '',
    },
  ].map((po) => {
    const items = po.items.map((it) => ({
      ...it,
      inventoryItemId: it.inventoryItemId || inventory[0].id,
      name: it.name || 'Supply item',
    }));
    const estTotal = items.reduce((s, it) => s + it.qty * it.estUnitPrice, 0);
    return { ...po, items, estTotal };
  });

  const supplierInvoices = [
    {
      id: 'SI-801',
      branchId: 'BR-DOKKI',
      supplierId: 'S-01',
      purchaseOrderId: 'PO-603',
      amount: 11850,
      dueDate: addDaysISODate(today, 12),
      status: 'Unpaid',
      issuedDate: addDaysISODate(today, -10),
    },
    {
      id: 'SI-802',
      branchId: 'BR-ZAYED',
      supplierId: 'S-02',
      purchaseOrderId: null,
      amount: 22400,
      dueDate: addDaysISODate(today, 8),
      status: 'Unpaid',
      issuedDate: addDaysISODate(today, -6),
    },
    {
      id: 'SI-803',
      branchId: 'BR-DOKKI',
      supplierId: 'S-05',
      purchaseOrderId: null,
      amount: 9600,
      dueDate: addDaysISODate(today, -2),
      status: 'Paid',
      issuedDate: addDaysISODate(today, -25),
    },
    {
      id: 'SI-804',
      branchId: 'BR-ZAYED',
      supplierId: 'S-03',
      purchaseOrderId: null,
      amount: 5400,
      dueDate: addDaysISODate(today, 18),
      status: 'Unpaid',
      issuedDate: addDaysISODate(today, -3),
    },
  ];

  const refillRequests = [];
  const lowInv = inventory.filter((x) => x.status !== 'OK');
  for (let i = 0; i < 12; i++) {
    const pool = lowInv.length ? lowInv : inventory;
    const item = pool[i % pool.length];
    refillRequests.push({
      id: `RF-${100 + i}`,
      branchId: item.branchId,
      inventoryItemId: item.id,
      requestedQty: 20 + (i % 8) * 5,
      status: pick(['Pending', 'Approved', 'Ordered'], i),
      date: addDaysISODate(today, -(i % 14)),
      requestedBy: pick(['A-001', 'A-002'], i),
    });
  }

  const deliveryRecords = [
    {
      id: 'DL-01',
      branchId: 'BR-ZAYED',
      supplierId: 'S-04',
      purchaseOrderId: 'PO-604',
      date: addDaysISODate(today, -28),
      notes: 'Full match · signed POD.',
      receiptStatus: 'Complete',
      lines:
        purchaseOrders.find((p) => p.id === 'PO-604')?.items.map((it) => ({
          inventoryItemId: it.inventoryItemId,
          deliveredQty: it.qty,
          orderedQty: it.qty,
          variance: 0,
        })) || [],
    },
    {
      id: 'DL-02',
      branchId: 'BR-DOKKI',
      supplierId: 'S-03',
      purchaseOrderId: 'PO-603',
      date: addDaysISODate(today, -16),
      notes: 'Minor mismatch: 1 box short on pouches, credited on next invoice.',
      receiptStatus: 'Mismatch',
      lines: (purchaseOrders.find((p) => p.id === 'PO-603')?.items || []).map((it, idx) => ({
        inventoryItemId: it.inventoryItemId,
        orderedQty: it.qty,
        deliveredQty: it.qty - (idx === 0 ? 1 : 0),
        variance: -(idx === 0 ? 1 : 0),
      })),
    },
  ];

  const ratings = [];
  const p1Done = appointments
    .filter((a) => a.patientId === 'P-001' && a.status === 'Completed')
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const unratedAppt =
    appointments.find((a) => a.id === 'APT-LUJ-H1' && a.status === 'Completed') || p1Done[0];
  if (unratedAppt) {
    unratedAppt.ratingEligible = true;
    ratings.push({
      id: 'RT-LUJ-PEND',
      branchId: unratedAppt.branchId,
      appointmentId: unratedAppt.id,
      patientId: 'P-001',
      stars: 0,
      doctorStars: 0,
      experienceStars: 0,
      comment: '',
      submitted: false,
    });
    p1Done
      .filter((a) => a.id !== unratedAppt.id)
      .slice(0, 11)
      .forEach((a, i) => {
      ratings.push({
        id: `RT-P1-${100 + i}`,
        branchId: a.branchId,
        appointmentId: a.id,
        patientId: 'P-001',
        stars: 4 + (i % 2),
        doctorStars: 5,
        experienceStars: 4 + (i % 2),
        comment: pick(['Excellent care and clear explanations.', 'Very professional team.', 'Minimal wait time.', 'Spotless clinic.'], i),
        submitted: true,
      });
    });
  }

  const accountsPayableSummary = {
    openSupplierBalance: supplierInvoices.filter((s) => s.status === 'Unpaid').reduce((sum, s) => sum + s.amount, 0),
  };

  return {
    clinic: CLINIC,
    branches,
    serviceRates: SERVICE_RATES,
    smilePreviews: [],
    postTreatmentCare: [],
    patients,
    dentists,
    assistants,
    appointments,
    visits,
    medicalRecords,
    treatmentRecords,
    prescriptions,
    invoices,
    payments,
    accountsReceivable,
    inventory,
    supplyUsage,
    suppliers: SUPPLIERS,
    purchaseOrders,
    supplierInvoices,
    refillRequests,
    deliveryRecords,
    ratings,
    accountsPayableSummary,
  };
}
