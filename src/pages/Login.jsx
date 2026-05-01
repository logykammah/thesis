import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth, getRoleHomePath } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { CLINIC } from '../data/clinicMeta';
import {
  PORTAL_CLINIC_OWNER,
  PORTAL_PATIENT_USERS,
  PORTAL_DENTIST_USERS,
  PORTAL_ASSISTANT_USERS,
} from '../data/portalAccounts';

const STAFF_ROLE_BOXES = [
  {
    id: 'dentist',
    kicker: 'Clinical',
    title: 'Dentists',
    description: 'Doctors and specialists — charts, visits, prescriptions.',
  },
  {
    id: 'assistant',
    kicker: 'Chairside & front desk',
    title: 'Dental assistants',
    description: 'Scheduling, records, inventory, and patient support.',
  },
  {
    id: 'owner',
    kicker: 'Administration',
    title: 'Clinic owner',
    description: 'Full clinic oversight — finance, approvals, and reports.',
  },
];

function accountsForUserType(type) {
  switch (type) {
    case 'patient':
      return PORTAL_PATIENT_USERS;
    case 'dentist':
      return PORTAL_DENTIST_USERS;
    case 'assistant':
      return PORTAL_ASSISTANT_USERS;
    case 'owner':
      return [PORTAL_CLINIC_OWNER];
    default:
      return PORTAL_PATIENT_USERS;
  }
}

function profileKey(profile) {
  return `${profile.role}:${profile.id}`;
}

function labelForProfile(profile) {
  if (profile.role === 'patient') return `Patient — ${profile.displayName}`;
  if (profile.role === 'dentist') return `Dentist — ${profile.displayName}`;
  if (profile.role === 'assistant') return `Dental assistant — ${profile.displayName}`;
  if (profile.role === 'owner') return `Clinic owner — ${profile.displayName}`;
  return profile.displayName;
}

function parseProfileKey(key) {
  const [role, ...rest] = key.split(':');
  const id = rest.join(':');
  const pools = [...PORTAL_PATIENT_USERS, ...PORTAL_DENTIST_USERS, ...PORTAL_ASSISTANT_USERS, PORTAL_CLINIC_OWNER];
  return pools.find((p) => p.role === role && p.id === id) || PORTAL_CLINIC_OWNER;
}

function sanitizeNextPath(next) {
  if (!next || typeof next !== 'string' || !next.startsWith('/')) return null;
  const prefixes = ['/patient', '/dentist', '/assistant', '/owner'];
  if (prefixes.some((p) => next === p || next.startsWith(`${p}/`))) return next;
  return null;
}

const signupMinimal = { fullName: '', phone: '' };

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

function findPatientByLoginInput(input, patients) {
  const raw = input.trim();
  if (!raw) return null;
  if (raw.includes('@')) {
    return patients.find((p) => p.email?.toLowerCase() === raw.toLowerCase()) || null;
  }
  const d = digitsOnly(raw);
  if (!d) return null;
  return patients.find((p) => digitsOnly(p.phone || '') === d) || null;
}

export function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const { state, registerPatient, pushToast } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const from = location.state?.from;
  const nextParam = sanitizeNextPath(searchParams.get('next'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(() =>
    searchParams.get('portal') === 'staff' ? 'dentist' : 'patient',
  );
  const [accountKey, setAccountKey] = useState(() => profileKey(PORTAL_DENTIST_USERS[0]));
  const [patientMode, setPatientMode] = useState('login');
  const [signupForm, setSignupForm] = useState(signupMinimal);

  const accountList = useMemo(() => accountsForUserType(userType), [userType]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (userType === 'patient') return;
    const first = accountList[0];
    if (first) setAccountKey(profileKey(first));
  }, [userType, accountList]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup' && userType === 'patient') {
      setPatientMode('signup');
    }
  }, [searchParams, userType]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedStaffProfile = useMemo(() => parseProfileKey(accountKey), [accountKey]);

  if (isAuthenticated && user) {
    return <Navigate to={from || getRoleHomePath(user.role)} replace />;
  }

  const go = (profile) => {
    login(profile);
    const dest = from || nextParam || getRoleHomePath(profile.role);
    navigate(dest, { replace: true });
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      pushToast('Please enter your password.', 'error');
      return;
    }
    go(selectedStaffProfile);
  };

  const handlePatientLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      pushToast('Please enter your mobile number or the email on file with the clinic.', 'error');
      return;
    }
    const p = findPatientByLoginInput(username, state.patients);
    if (!p) {
      pushToast('No patient record matches that number or email. Try again or create an account.', 'error');
      return;
    }
    go({ role: 'patient', id: p.id, displayName: p.fullName });
  };

  const handlePatientSignup = (e) => {
    e.preventDefault();
    const name = signupForm.fullName.trim();
    const phone = signupForm.phone.trim();
    if (!name) {
      pushToast('Please enter your full name.', 'error');
      return;
    }
    if (!phone) {
      pushToast('Please enter your mobile number.', 'error');
      return;
    }
    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length < 10) {
      pushToast('Please enter a valid mobile number.', 'error');
      return;
    }
    if (state.patients.some((p) => digitsOnly(p.phone || '') === phoneDigits)) {
      pushToast('This number is already registered. Use Log in with your mobile number or email.', 'error');
      return;
    }
    const ts = Date.now();
    const email = `patient.${ts}@portal.claritydental.clinic`;
    const nationalId = `9${String(ts).slice(-13)}`.padEnd(14, '0').slice(0, 14);
    const res = registerPatient({
      fullName: name,
      email,
      phone,
      nationalId,
      dob: '1990-01-01',
      gender: 'Female',
      address: '—',
      bloodType: '—',
      allergies: 'None known',
      chronicConditions: 'None',
      emergencyName: name,
      emergencyRelation: 'Self',
      emergencyPhone: phone,
      notes: 'Registered via patient portal — details to be confirmed at first visit.',
    });
    if (!res?.ok || !res.patientId) return;
    login({ role: 'patient', id: res.patientId, displayName: name });
    const dest = from || nextParam || '/patient';
    navigate(dest, { replace: true });
  };

  const setPatientTab = (mode) => {
    setPatientMode(mode);
    const next = new URLSearchParams(searchParams);
    if (mode === 'signup') next.set('tab', 'signup');
    else next.delete('tab');
    next.delete('portal');
    setSearchParams(next, { replace: true });
  };

  const syncPortalParam = (nextType) => {
    const next = new URLSearchParams(searchParams);
    if (nextType === 'patient') next.delete('portal');
    else next.set('portal', 'staff');
    setSearchParams(next, { replace: true });
  };

  const choosePatientPortal = () => {
    setUserType('patient');
    setPatientMode('login');
    syncPortalParam('patient');
  };

  const chooseStaffPortal = (roleId = 'dentist') => {
    setUserType(roleId);
    setPatientMode('login');
    syncPortalParam('staff');
  };

  const chooseStaffRole = (roleId) => {
    setUserType(roleId);
    syncPortalParam('staff');
  };

  return (
    <div className="login-portal">
      <div className={`login-portal-center${userType !== 'patient' ? ' login-portal-center--staff' : ''}`}>
        <div className={`login-portal-card${userType !== 'patient' ? ' login-portal-card--staff' : ''}`}>
          <div className="login-portal-header">
            <Link to="/" className="login-portal-logo-link" aria-label="Clarity Dental Clinic — sign in">
              <BrandLogo variant="horizontal" />
            </Link>
            <p className="login-portal-tagline">Secure access for registered patients and authorized staff.</p>
          </div>

          <h1 className="login-portal-title font-serif">
            {userType === 'patient' && patientMode === 'signup' ? 'Create your patient record' : 'Sign in'}
          </h1>
          <p className="login-portal-intro">
            {userType === 'patient' && patientMode === 'signup'
              ? 'Enter your name and mobile number. We will open your patient portal as soon as your record is created.'
              : userType === 'patient'
                ? 'Log in with the mobile number or email we have on file. New to Clarity? Switch to Create account.'
                : 'Pick your workstation, choose your named account, then enter your password.'}
          </p>

          <div className="login-portal-segment login-portal-segment--audience" role="tablist" aria-label="Portal access">
            <button
              type="button"
              role="tab"
              aria-selected={userType === 'patient'}
              className={`login-portal-segment-btn login-portal-segment-btn--portal${userType === 'patient' ? ' is-active' : ''}`}
              onClick={choosePatientPortal}
            >
              Patient portal
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={userType !== 'patient'}
              className={`login-portal-segment-btn login-portal-segment-btn--portal${userType !== 'patient' ? ' is-active' : ''}`}
              onClick={() => {
                if (userType === 'patient') chooseStaffPortal('dentist');
              }}
            >
              Staff portal
            </button>
          </div>

          {userType !== 'patient' ? (
            <div className="login-staff-role-wrap">
              <p className="login-staff-role-heading">Choose your role</p>
              <div className="login-staff-role-grid" role="tablist" aria-label="Staff role">
                {STAFF_ROLE_BOXES.map((box) => (
                  <button
                    key={box.id}
                    type="button"
                    role="tab"
                    aria-selected={userType === box.id}
                    className={`login-staff-role-box${userType === box.id ? ' is-selected' : ''}`}
                    onClick={() => chooseStaffRole(box.id)}
                  >
                    <span className="login-staff-role-kicker">{box.kicker}</span>
                    <span className="login-staff-role-title font-serif">{box.title}</span>
                    <span className="login-staff-role-desc">{box.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {userType === 'patient' ? (
            <>
              <div className="login-portal-segment" role="tablist" aria-label="Patient portal options">
                <button
                  type="button"
                  role="tab"
                  aria-selected={patientMode === 'login'}
                  className={`login-portal-segment-btn${patientMode === 'login' ? ' is-active' : ''}`}
                  onClick={() => setPatientTab('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={patientMode === 'signup'}
                  className={`login-portal-segment-btn${patientMode === 'signup' ? ' is-active' : ''}`}
                  onClick={() => setPatientTab('signup')}
                >
                  Create account
                </button>
              </div>

              {patientMode === 'login' ? (
                <form className="login-portal-form" onSubmit={handlePatientLogin}>
                  <div className="form-row">
                    <label htmlFor="patientContact">Mobile number or email</label>
                    <input
                      id="patientContact"
                      className="input"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      placeholder="e.g. 0100 223 4455"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary login-portal-submit">
                    Sign in
                  </button>
                  <p className="login-portal-handover-sub muted">
                    First visit?{' '}
                    <button type="button" className="link-inline" onClick={() => setPatientTab('signup')}>
                      Create your patient record
                    </button>{' '}
                    — then you can book and manage appointments online.
                  </p>
                </form>
              ) : (
                <form className="login-portal-form" onSubmit={handlePatientSignup}>
                  <div className="form-row">
                    <label htmlFor="signupName">Full name</label>
                    <input
                      id="signupName"
                      className="input"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      autoComplete="name"
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="signupPhone">Mobile number</label>
                    <input
                      id="signupPhone"
                      className="input"
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      autoComplete="tel"
                      placeholder="e.g. 0100 223 4455"
                    />
                  </div>
                  <p className="muted" style={{ fontSize: '0.78rem', lineHeight: 1.45, margin: '0 0 0.5rem' }}>
                    Additional details can be completed with reception or at your first visit.
                  </p>
                  <button type="submit" className="btn btn-primary login-portal-submit">
                    Create account and sign in
                  </button>
                  <p className="login-portal-handover-sub muted">
                    Already registered?{' '}
                    <button type="button" className="link-inline" onClick={() => setPatientTab('login')}>
                      Log in with your mobile number or email
                    </button>
                    .
                  </p>
                </form>
              )}
            </>
          ) : (
            <form className="login-portal-form" onSubmit={handleStaffSubmit}>
              <div className="form-row">
                <label htmlFor="account">Who are you signing in as?</label>
                <select id="account" className="select" value={accountKey} onChange={(e) => setAccountKey(e.target.value)}>
                  {accountList.map((p) => (
                    <option key={profileKey(p)} value={profileKey(p)}>
                      {labelForProfile(p)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn btn-primary login-portal-submit">
                Sign in to workspace
              </button>
              <p className="login-portal-handover-sub muted">
                Booking an appointment? Choose <button type="button" className="link-inline" onClick={choosePatientPortal}>Patient portal</button> above, then log in or create an account.
              </p>
            </form>
          )}

          {userType !== 'patient' || patientMode === 'login' ? (
            <div className="login-portal-links" style={{ marginTop: userType === 'patient' ? '1rem' : 0 }}>
              <button type="button" className="link-inline">
                Forgot password?
              </button>
              <Link to="/clinic" className="link-inline">
                Clinic information
              </Link>
            </div>
          ) : (
            <div className="login-portal-links" style={{ marginTop: '1rem' }}>
              <Link to="/clinic" className="link-inline">
                Clinic information
              </Link>
            </div>
          )}

          <p className="muted" style={{ marginTop: '0.85rem', fontSize: '0.78rem', lineHeight: 1.45, textAlign: 'center' }}>
            To reset your password, contact reception or your department administrator.
          </p>

          <p className="login-portal-footnote muted">
            {CLINIC.name} · {CLINIC.phones[0]} · {CLINIC.phones[1]}
          </p>
        </div>
      </div>
    </div>
  );
}
