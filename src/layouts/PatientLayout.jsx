import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { PortalWelcomeBanner } from '../components/PortalWelcomeBanner';
import { PortalAiChat } from '../components/PortalAiChat';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/patient', label: 'Dashboard', end: true },
  { to: '/patient/book', label: 'Book Appointment' },
  { to: '/patient/appointments', label: 'My Appointments' },
  { to: '/patient/visits', label: 'Previous Visits' },
  { to: '/patient/invoices', label: 'View Invoice' },
  { to: '/patient/payment-history', label: 'Payment History' },
  { to: '/patient/rate', label: 'Feedback' },
  { to: '/patient/profile', label: 'Profile' },
];

export function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="portal-shell" style={{ position: 'relative' }}>
      <header className="portal-top">
        <div className="flex gap-md" style={{ alignItems: 'center', minWidth: 0 }}>
          <Link to="/patient" className="portal-logo-hero portal-logo-link" aria-label="Patient portal home">
            <BrandLogo />
          </Link>
          <div style={{ minWidth: 0 }}>
            <div className="font-serif" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              Patient portal
            </div>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              {user?.displayName}
            </div>
          </div>
        </div>
        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <nav
        className="portal-nav"
        style={{ padding: '0.5rem 1.5rem', background: '#eef2f6', borderBottom: '1px solid var(--color-border)' }}
      >
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `portal-link${isActive ? ' active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="portal-body">
        <PortalWelcomeBanner portalLabel="Patient portal" />
        <Outlet />
      </div>
      <PortalAiChat preset="patient" />
    </div>
  );
}
