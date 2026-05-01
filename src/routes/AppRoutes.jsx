import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { StaffLayout } from '../layouts/StaffLayout';
import { PatientLayout } from '../layouts/PatientLayout';
import { HomePage } from '../pages/HomePage';
import { Login } from '../pages/Login';
import { NotFound } from '../pages/NotFound';

import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { BookAppointment } from '../pages/patient/BookAppointment';
import { MyAppointments } from '../pages/patient/MyAppointments';
import { PatientInvoices } from '../pages/patient/PatientInvoices';
import { PatientPayment } from '../pages/patient/PatientPayment';
import { PatientPaymentHistory } from '../pages/patient/PatientPaymentHistory';
import { PatientRate } from '../pages/patient/PatientRate';
import { PatientProfile } from '../pages/patient/PatientProfile';
import { PreviousVisits } from '../pages/patient/PreviousVisits';

import { DentistDashboard } from '../pages/dentist/DentistDashboard';
import { DentistAppointments } from '../pages/dentist/DentistAppointments';
import { PatientRecords } from '../pages/dentist/PatientRecords';
import { TreatmentRecords } from '../pages/dentist/TreatmentRecords';
import { PrescriptionsPage } from '../pages/dentist/PrescriptionsPage';
import { VisitNotes } from '../pages/dentist/VisitNotes';
import { DentistProfile } from '../pages/dentist/DentistProfile';

import { AssistantDashboard } from '../pages/assistant/AssistantDashboard';
import { RegisterPatient } from '../pages/assistant/RegisterPatient';
import { UpdatePatientInfo } from '../pages/assistant/UpdatePatientInfo';
import { ManageAppointments } from '../pages/assistant/ManageAppointments';
import { GenerateInvoice } from '../pages/assistant/GenerateInvoice';
import { RecordPaymentAssistant } from '../pages/assistant/RecordPaymentAssistant';
import { InventoryPage } from '../pages/assistant/InventoryPage';
import { SupplyUsage } from '../pages/assistant/SupplyUsage';
import { RefillRequests } from '../pages/assistant/RefillRequests';
import { PurchaseOrders } from '../pages/assistant/PurchaseOrders';
import { SupplierDeliveries } from '../pages/assistant/SupplierDeliveries';
import { AssistantProfile } from '../pages/assistant/AssistantProfile';

import { OwnerDashboard } from '../pages/owner/OwnerDashboard';
import { Reports } from '../pages/owner/Reports';
import { InventoryStatus } from '../pages/owner/InventoryStatus';
import { AccountsReceivablePage } from '../pages/owner/AccountsReceivablePage';
import { POApprovals } from '../pages/owner/POApprovals';
import { SupplierInvoicesPage } from '../pages/owner/SupplierInvoicesPage';
import { PaymentMonitoring } from '../pages/owner/PaymentMonitoring';
import { RatingsPage } from '../pages/owner/RatingsPage';
import { OwnerProfile } from '../pages/owner/OwnerProfile';

const dentistNav = [
  { to: '', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/appointments', label: 'Appointments', icon: 'calendar' },
  { to: '/records', label: 'Patient Records', icon: 'users' },
  { to: '/treatments', label: 'Treatment Records', icon: 'file' },
  { to: '/prescriptions', label: 'Prescriptions', icon: 'rx' },
  { to: '/visit-notes', label: 'Visit Notes', icon: 'note' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

const assistantNav = [
  { to: '', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/register', label: 'Register Patient', icon: 'register' },
  { to: '/update-patient', label: 'Edit patient details', icon: 'edit' },
  { to: '/appointments', label: 'Appointments', icon: 'appt' },
  { to: '/invoices/new', label: 'Generate Invoice', icon: 'invoice' },
  { to: '/payments', label: 'Record Payment', icon: 'pay' },
  { to: '/inventory', label: 'Inventory', icon: 'box' },
  { to: '/supply-usage', label: 'Supply Usage', icon: 'cart' },
  { to: '/refills', label: 'Refill Requests', icon: 'chart' },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: 'cart' },
  { to: '/deliveries', label: 'Supplier Deliveries', icon: 'truck' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

const ownerNav = [
  { to: '', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/reports', label: 'Reports', icon: 'chart' },
  { to: '/inventory', label: 'Inventory Status', icon: 'box' },
  { to: '/receivables', label: 'Accounts Receivable', icon: 'money' },
  { to: '/po-approvals', label: 'PO Approvals', icon: 'cart' },
  { to: '/supplier-invoices', label: 'Supplier Invoices', icon: 'invoice' },
  { to: '/payments', label: 'Payment Monitoring', icon: 'pay' },
  { to: '/ratings', label: 'Ratings', icon: 'star' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/clinic" element={<HomePage />} />

      <Route element={<ProtectedRoute role="patient" />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="visits" element={<PreviousVisits />} />
          <Route path="invoices" element={<PatientInvoices />} />
          <Route path="pay" element={<PatientPayment />} />
          <Route path="payment-history" element={<PatientPaymentHistory />} />
          <Route path="rate" element={<PatientRate />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="dentist" />}>
        <Route path="/dentist" element={<StaffLayout basePath="/dentist" navItems={dentistNav} title="Dentist workspace" />}>
          <Route index element={<DentistDashboard />} />
          <Route path="appointments" element={<DentistAppointments />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="treatments" element={<TreatmentRecords />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="visit-notes" element={<VisitNotes />} />
          <Route path="profile" element={<DentistProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="assistant" />}>
        <Route
          path="/assistant"
          element={<StaffLayout basePath="/assistant" navItems={assistantNav} title="Dental assistant workspace" />}
        >
          <Route index element={<AssistantDashboard />} />
          <Route path="register" element={<RegisterPatient />} />
          <Route path="update-patient" element={<UpdatePatientInfo />} />
          <Route path="appointments" element={<ManageAppointments />} />
          <Route path="invoices/new" element={<GenerateInvoice />} />
          <Route path="payments" element={<RecordPaymentAssistant />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="supply-usage" element={<SupplyUsage />} />
          <Route path="refills" element={<RefillRequests />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="deliveries" element={<SupplierDeliveries />} />
          <Route path="profile" element={<AssistantProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="owner" />}>
        <Route path="/owner" element={<StaffLayout basePath="/owner" navItems={ownerNav} title="Clinic owner workspace" />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="inventory" element={<InventoryStatus />} />
          <Route path="receivables" element={<AccountsReceivablePage />} />
          <Route path="po-approvals" element={<POApprovals />} />
          <Route path="supplier-invoices" element={<SupplierInvoicesPage />} />
          <Route path="payments" element={<PaymentMonitoring />} />
          <Route path="ratings" element={<RatingsPage />} />
          <Route path="profile" element={<OwnerProfile />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/clinic" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
