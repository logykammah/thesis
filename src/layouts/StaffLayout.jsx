import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { PortalWelcomeBanner } from '../components/PortalWelcomeBanner';
import { PortalAiChat } from '../components/PortalAiChat';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { branchNameFromState } from '../utils/branch';

const ICONS = {
  dashboard: '◆',
  calendar: '▣',
  users: '◎',
  file: '▤',
  rx: '✚',
  note: '✎',
  profile: '○',
  register: '＋',
  edit: '✎',
  appt: '▣',
  invoice: '₤',
  pay: '◈',
  box: '▦',
  cart: '⚑',
  truck: '➤',
  chart: '▤',
  money: '◈',
  star: '★',
};

function chatPresetFromBase(basePath) {
  if (basePath === '/dentist') return 'dentist';
  if (basePath === '/assistant') return 'assistant';
  if (basePath === '/owner') return 'owner';
  return 'dentist';
}

function branchLine(user, state) {
  if (!user) return '';
  if (user.role === 'assistant' && user.branchId) {
    return `${branchNameFromState(state, user.branchId)} branch`;
  }
  if (user.role === 'dentist' && user.branchIds?.length) {
    return user.branchIds.map((id) => branchNameFromState(state, id)).join(' · ');
  }
  return '';
}

export function StaffLayout({ basePath, navItems, title }) {
  const { user, logout } = useAuth();
  const { state } = useAppData();
  const navigate = useNavigate();
  const bLine = branchLine(user, state);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="shell" style={{ position: 'relative' }}>
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.65rem' }}>
          <Link to={basePath} className="sidebar-brand-link" aria-label="Workspace home">
            <BrandLogo variant="horizontal" density="compact" />
          </Link>
          <span className="sidebar-brand-sub" style={{ paddingLeft: '0.1rem' }}>
            Management System
          </span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to || '__index'}
              to={`${basePath}${item.to}`}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{ICONS[item.icon] || '•'}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.72rem', opacity: 0.78 }}>
          {title}
        </div>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <div>
            <p className="topbar-title">{user?.displayName}</p>
            <div className="muted" style={{ fontSize: '0.82rem' }}>
              {user?.specialty || user?.title || user?.role}
              {bLine ? ` · ${bLine}` : ''}
            </div>
          </div>
          <div className="flex gap-sm" style={{ alignItems: 'center' }}>
            <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>
              {user?.role}
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>
        <main className="shell-content">
          <PortalWelcomeBanner portalLabel={title} branchLine={bLine || undefined} />
          <Outlet />
        </main>
      </div>
      <PortalAiChat preset={chatPresetFromBase(basePath)} />
    </div>
  );
}
