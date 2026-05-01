import { useAuth } from '../context/AuthContext';
import { CLINIC } from '../data/clinicMeta';

/**
 * @param {object} props
 * @param {string} props.portalLabel e.g. "Patient portal" or workspace title
 * @param {string} [props.branchLine] optional branch context for staff
 */
export function PortalWelcomeBanner({ portalLabel, branchLine }) {
  const { user } = useAuth();

  return (
    <div className="portal-welcome-banner">
      <div className="portal-welcome-banner-inner">
        <p className="portal-welcome-kicker">Welcome back</p>
        <h2 className="portal-welcome-title font-serif">{CLINIC.name}</h2>
        <p className="portal-welcome-meta">
          <strong>{portalLabel}</strong>
          <span className="portal-welcome-sep"> · </span>
          <span>{user?.displayName}</span>
        </p>
        {branchLine ? <p className="portal-welcome-branch muted">{branchLine}</p> : null}
      </div>
    </div>
  );
}
