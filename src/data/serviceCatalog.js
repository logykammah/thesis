/**
 * Clarity Dental — full service catalog (Egypt EGP–style ranges).
 * `price` on each rate = typical invoice line (mid-range), rounded.
 */

export const SERVICE_CATEGORY_ORDER = [
  { id: 'general', label: 'General Dentistry' },
  { id: 'endodontics', label: 'Endodontics' },
  { id: 'cosmetic', label: 'Cosmetic' },
  { id: 'prosthodontics', label: 'Prosthodontics' },
  { id: 'implants', label: 'Implants' },
  { id: 'orthodontics', label: 'Orthodontics' },
  { id: 'periodontics', label: 'Periodontics' },
  { id: 'pediatric', label: 'Pediatric' },
  { id: 'emergency', label: 'Emergency' },
];

/** Values for staff “specialty” dropdowns — aligned with categories */
export const SPECIALTIES = SERVICE_CATEGORY_ORDER.map((c) => c.label);

const CATEGORY_BY_ID = Object.fromEntries(SERVICE_CATEGORY_ORDER.map((c) => [c.id, c.label]));

/** Individual billable / bookable services */
const SERVICE_DEFINITIONS = [
  // —— General Dentistry
  {
    code: 'GEN-CHK',
    name: 'Dental check-up & consultation',
    categoryId: 'general',
    description: 'Clinical exam, treatment planning, and preventive guidance.',
    min: 400,
    max: 700,
  },
  {
    code: 'GEN-SCALE',
    name: 'Teeth cleaning (scaling & polishing)',
    categoryId: 'general',
    description: 'Professional prophylaxis and stain removal.',
    min: 500,
    max: 800,
  },
  {
    code: 'GEN-FLUOR',
    name: 'Fluoride treatment (adult)',
    categoryId: 'general',
    description: 'Varnish or gel application to strengthen enamel.',
    min: 250,
    max: 450,
  },
  {
    code: 'GEN-FILL-C',
    name: 'Dental filling — composite',
    categoryId: 'general',
    description: 'Tooth-coloured restoration for caries or minor defects.',
    min: 800,
    max: 1500,
  },
  {
    code: 'GEN-FILL-A',
    name: 'Dental filling — amalgam',
    categoryId: 'general',
    description: 'Durable posterior restoration where clinically indicated.',
    min: 600,
    max: 1200,
  },
  {
    code: 'GEN-EXT-S',
    name: 'Tooth extraction (simple)',
    categoryId: 'general',
    description: 'Routine extraction with local anaesthesia.',
    min: 500,
    max: 1200,
  },
  {
    code: 'GEN-EXT-W',
    name: 'Surgical extraction (impacted / wisdom)',
    categoryId: 'general',
    description: 'Surgical removal including flap and suturing when required.',
    min: 1500,
    max: 3500,
  },
  // —— Endodontics
  {
    code: 'ENDO-RCT-A',
    name: 'Root canal treatment (anterior)',
    categoryId: 'endodontics',
    description: 'Single-canal or straightforward anterior RCT.',
    min: 2500,
    max: 4000,
  },
  {
    code: 'ENDO-RCT-P',
    name: 'Root canal treatment (posterior / molar)',
    categoryId: 'endodontics',
    description: 'Multi-canal molar endodontics with rubber dam isolation.',
    min: 3500,
    max: 5000,
  },
  {
    code: 'ENDO-RETX',
    name: 'Root canal retreatment',
    categoryId: 'endodontics',
    description: 'Removal of previous root filling and re-treatment.',
    min: 4500,
    max: 7500,
  },
  {
    code: 'ENDO-EMG',
    name: 'Emergency pain relief (pulpitis)',
    categoryId: 'endodontics',
    description: 'Urgent opening, medication, and interim management.',
    min: 800,
    max: 1500,
  },
  // —— Cosmetic
  {
    code: 'COS-WHT-O',
    name: 'Teeth whitening (in-office)',
    categoryId: 'cosmetic',
    description: 'Chairside bleaching session with isolation.',
    min: 2500,
    max: 4000,
  },
  {
    code: 'COS-WHT-H',
    name: 'Teeth whitening (home kit)',
    categoryId: 'cosmetic',
    description: 'Custom trays and professional-grade gel for home use.',
    min: 2000,
    max: 3200,
  },
  {
    code: 'COS-VN-P',
    name: 'Veneers (porcelain)',
    categoryId: 'cosmetic',
    description: 'Lab-fabricated ceramic veneers per unit (planning separate).',
    min: 6000,
    max: 12000,
  },
  {
    code: 'COS-VN-C',
    name: 'Veneers (composite)',
    categoryId: 'cosmetic',
    description: 'Chairside composite veneers / edge bonding.',
    min: 3000,
    max: 7000,
  },
  {
    code: 'COS-SMILE',
    name: 'Smile design consultation',
    categoryId: 'cosmetic',
    description: 'Digital or wax-up planning session for aesthetic cases.',
    min: 800,
    max: 1500,
  },
  {
    code: 'COS-BOND',
    name: 'Cosmetic bonding',
    categoryId: 'cosmetic',
    description: 'Composite shaping for chips, gaps, or minor asymmetry.',
    min: 1200,
    max: 2500,
  },
  // —— Prosthodontics
  {
    code: 'PRO-ZIR',
    name: 'Dental crown (zirconia)',
    categoryId: 'prosthodontics',
    description: 'Full-coverage zirconia crown per unit.',
    min: 5000,
    max: 8000,
  },
  {
    code: 'PRO-PFM',
    name: 'Dental crown (porcelain-fused-to-metal)',
    categoryId: 'prosthodontics',
    description: 'PFM crown for posterior aesthetics and strength.',
    min: 4000,
    max: 6500,
  },
  {
    code: 'PRO-BRIDGE',
    name: 'Dental bridge (per unit)',
    categoryId: 'prosthodontics',
    description: 'Fixed bridge pontic or retainer unit pricing basis.',
    min: 4500,
    max: 7500,
  },
  {
    code: 'PRO-DENT-F',
    name: 'Full denture',
    categoryId: 'prosthodontics',
    description: 'Complete removable denture — arch.',
    min: 8000,
    max: 15000,
  },
  {
    code: 'PRO-DENT-P',
    name: 'Partial denture',
    categoryId: 'prosthodontics',
    description: 'Cast or flexible partial denture.',
    min: 6000,
    max: 12000,
  },
  {
    code: 'PRO-IMP-PR',
    name: 'Implant-supported prosthesis',
    categoryId: 'prosthodontics',
    description: 'Crown or bridge on implants — prosthetic phase.',
    min: 15000,
    max: 28000,
  },
  // —— Implants
  {
    code: 'IMP-PLACE',
    name: 'Implant placement (single)',
    categoryId: 'implants',
    description: 'Surgical placement of dental implant fixture.',
    min: 12000,
    max: 22000,
  },
  {
    code: 'IMP-CR',
    name: 'Implant restoration (crown on implant)',
    categoryId: 'implants',
    description: 'Definitive or provisional crown on integrated implant.',
    min: 8000,
    max: 15000,
  },
  {
    code: 'IMP-GRAFT',
    name: 'Bone grafting',
    categoryId: 'implants',
    description: 'Ridge preservation or augmentation for implant site.',
    min: 4000,
    max: 9000,
  },
  {
    code: 'IMP-SINUS',
    name: 'Sinus lift',
    categoryId: 'implants',
    description: 'Sinus floor elevation for posterior maxillary implants.',
    min: 8000,
    max: 16000,
  },
  // —— Orthodontics
  {
    code: 'ORT-MET',
    name: 'Metal braces (adjustment visit)',
    categoryId: 'orthodontics',
    description: 'Routine fixed appliance adjustment and wire change.',
    min: 900,
    max: 1400,
  },
  {
    code: 'ORT-CER',
    name: 'Ceramic braces (adjustment visit)',
    categoryId: 'orthodontics',
    description: 'Aesthetic fixed appliance maintenance visit.',
    min: 1100,
    max: 1700,
  },
  {
    code: 'ORT-ALIGN',
    name: 'Clear aligners (aligner set / phase)',
    categoryId: 'orthodontics',
    description: 'Custom clear aligner therapy — typical per-phase fee band.',
    min: 15000,
    max: 38000,
  },
  {
    code: 'ORT-RET',
    name: 'Retainers',
    categoryId: 'orthodontics',
    description: 'Fixed or removable retention appliances.',
    min: 2500,
    max: 5000,
  },
  {
    code: 'ORT-REC',
    name: 'Orthodontic records & treatment planning',
    categoryId: 'orthodontics',
    description: 'Photos, models or scan, cephalometric analysis, plan.',
    min: 2200,
    max: 3500,
  },
  // —— Periodontics
  {
    code: 'PER-SRP',
    name: 'Deep cleaning (scaling & root planing — per quadrant)',
    categoryId: 'periodontics',
    description: 'Non-surgical periodontal therapy by quadrant.',
    min: 1200,
    max: 2200,
  },
  {
    code: 'PER-TX',
    name: 'Gum treatment (periodontal therapy)',
    categoryId: 'periodontics',
    description: 'Non-surgical management of periodontal pockets.',
    min: 1500,
    max: 3500,
  },
  {
    code: 'PER-SURG',
    name: 'Gum surgery (localized)',
    categoryId: 'periodontics',
    description: 'Resective or regenerative periodontal surgery — estimate.',
    min: 5000,
    max: 10000,
  },
  // —— Pediatric
  {
    code: 'PED-CHK',
    name: 'Kids check-up',
    categoryId: 'pediatric',
    description: 'Child exam, caries risk assessment, hygiene coaching.',
    min: 350,
    max: 600,
  },
  {
    code: 'PED-FLU',
    name: 'Fluoride for children',
    categoryId: 'pediatric',
    description: 'Age-appropriate fluoride varnish application.',
    min: 200,
    max: 400,
  },
  {
    code: 'PED-SEAL',
    name: 'Pit & fissure sealants (per tooth)',
    categoryId: 'pediatric',
    description: 'Protective sealant for permanent molars.',
    min: 350,
    max: 600,
  },
  {
    code: 'PED-ORTHO',
    name: 'Early orthodontic assessment',
    categoryId: 'pediatric',
    description: 'Growth and eruption screening with referral guidance.',
    min: 600,
    max: 1200,
  },
  // —— Emergency
  {
    code: 'EMG-PAIN',
    name: 'Emergency pain treatment',
    categoryId: 'emergency',
    description: 'Same-day assessment and palliative care.',
    min: 600,
    max: 1500,
  },
  {
    code: 'EMG-INF',
    name: 'Swelling / infection management',
    categoryId: 'emergency',
    description: 'Drainage planning, antibiotics prescription, follow-up.',
    min: 800,
    max: 2000,
  },
  {
    code: 'EMG-TRM',
    name: 'Dental trauma (broken tooth / accident)',
    categoryId: 'emergency',
    description: 'Stabilisation, splinting, or interim restoration.',
    min: 1000,
    max: 2500,
  },
];

function midPrice(min, max) {
  return Math.round((Number(min) + Number(max)) / 2);
}

/** Full rows for invoices, booking, and filters */
export const SERVICE_RATES = SERVICE_DEFINITIONS.map((s) => ({
  code: s.code,
  label: s.name,
  price: midPrice(s.min, s.max),
  categoryId: s.categoryId,
  categoryLabel: CATEGORY_BY_ID[s.categoryId] || s.categoryId,
  priceMin: s.min,
  priceMax: s.max,
  description: s.description,
}));

export function serviceByCode(code) {
  return SERVICE_RATES.find((r) => r.code === code) || null;
}

export function formatPriceRange(rate) {
  if (!rate) return '—';
  const a = rate.priceMin ?? rate.price;
  const b = rate.priceMax ?? rate.price;
  if (a === b) return `${a.toLocaleString('en-EG')} EGP`;
  return `${a.toLocaleString('en-EG')} – ${b.toLocaleString('en-EG')} EGP`;
}

/** Which clinical categories a dentist may book / bill under */
export function serviceCategoriesForDentist(dentist) {
  if (!dentist) return ['general'];
  if (Array.isArray(dentist.serviceCategories) && dentist.serviceCategories.length) {
    return dentist.serviceCategories;
  }
  const s = dentist.specialty || '';
  if (s.includes('Endo')) return ['endodontics', 'emergency'];
  if (s.includes('Ortho')) return ['orthodontics'];
  if (s.includes('Surgeon') || s.includes('Surgery')) return ['implants', 'general', 'emergency'];
  if (s.includes('Period')) return ['periodontics', 'general'];
  if (s.includes('Prosth')) return ['prosthodontics', 'general'];
  if (s.includes('Pediatric')) return ['pediatric', 'general'];
  if (s.includes('General')) return ['general', 'cosmetic', 'pediatric', 'emergency'];
  return ['general'];
}

export function servicesForDentist(serviceRates, dentist) {
  const cats = new Set(serviceCategoriesForDentist(dentist));
  return serviceRates.filter((r) => cats.has(r.categoryId));
}

/** Display line for appointment “department” */
export function dentistDisplaySpecialty(dentist) {
  if (!dentist) return 'General Dentistry';
  const s = dentist.specialty || '';
  if (s.includes('Endo')) return 'Endodontics';
  if (s.includes('Ortho')) return 'Orthodontics';
  if (s.includes('Surgeon') || s.includes('Surgery')) return 'Oral Surgery';
  if (s.includes('Period')) return 'Periodontics';
  if (s.includes('Prosth')) return 'Prosthodontics';
  if (s.includes('Pediatric')) return 'Pediatric';
  if (s.includes('General')) return 'General Dentistry';
  return 'General Dentistry';
}

export const SLOT_TIMES = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
];
