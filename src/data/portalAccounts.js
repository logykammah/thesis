/** Portal user records — IDs aligned with createSeedState */

export const PORTAL_CLINIC_OWNER = {
  role: 'owner',
  id: 'OWNER-001',
  displayName: 'Dr Amr Elkammah',
  title: 'Clinic Owner',
};

export const PORTAL_PATIENT_USERS = [
  { role: 'patient', id: 'P-001', displayName: 'Logyn Elkammah', email: 'yasmine.elsherif@email.com' },
  { role: 'patient', id: 'P-002', displayName: 'Karim Lotfy', email: 'karim.lotfy@email.com' },
  { role: 'patient', id: 'P-003', displayName: 'Nour Hamed', email: 'nour.hamed@email.com' },
  { role: 'patient', id: 'P-004', displayName: 'Omar Selim', email: 'omar.selim@email.com' },
  { role: 'patient', id: 'P-005', displayName: 'Farida Mansour', email: 'farida.mansour@email.com' },
  { role: 'patient', id: 'P-006', displayName: 'Tarek Anwar', email: 'tarek.anwar@email.com' },
  { role: 'patient', id: 'P-007', displayName: 'Mariam Khaled', email: 'mariam.khaled@email.com' },
  { role: 'patient', id: 'P-008', displayName: 'Hassan El-Badry', email: 'hassan.elbadry@email.com' },
  { role: 'patient', id: 'P-009', displayName: 'Salma Dawoud', email: 'salma.dawoud@email.com' },
  { role: 'patient', id: 'P-010', displayName: 'Youssef Gamal', email: 'youssef.gamal@email.com' },
  { role: 'patient', id: 'P-011', displayName: 'Reem Fathy', email: 'reem.fathy@email.com' },
  { role: 'patient', id: 'P-012', displayName: 'Ahmed Nour', email: 'ahmed.nour@email.com' },
  { role: 'patient', id: 'P-013', displayName: 'Dina Mostafa', email: 'dina.mostafa@email.com' },
  { role: 'patient', id: 'P-014', displayName: 'Khaled Ramy', email: 'khaled.ramy@email.com' },
];

export const PORTAL_DENTIST_USERS = [
  {
    role: 'dentist',
    id: 'D-001',
    displayName: 'Dr Youssef Hany',
    specialty: 'Endodontist',
    branchIds: ['BR-DOKKI', 'BR-ZAYED'],
  },
  {
    role: 'dentist',
    id: 'D-002',
    displayName: 'Dr Amr Elkammah',
    specialty: 'Prosthodontist',
    branchIds: ['BR-DOKKI', 'BR-ZAYED'],
  },
  {
    role: 'dentist',
    id: 'D-003',
    displayName: 'Dr Ahmed Samir',
    specialty: 'Oral and Maxillofacial Surgeon',
    branchIds: ['BR-DOKKI', 'BR-ZAYED'],
  },
];

export const PORTAL_ASSISTANT_USERS = [
  {
    role: 'assistant',
    id: 'A-001',
    displayName: 'Layla Ashraf',
    branchId: 'BR-DOKKI',
    title: 'Dental Assistant · Dokki',
  },
  {
    role: 'assistant',
    id: 'A-002',
    displayName: 'Malak Sherif',
    branchId: 'BR-ZAYED',
    title: 'Dental Assistant · Sheikh Zayed',
  },
];
