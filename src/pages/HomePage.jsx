import { Link, Navigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth, getRoleHomePath } from '../context/AuthContext';
import { CLINIC } from '../data/clinicMeta';
import { SERVICE_CATEGORY_ORDER } from '../data/serviceCatalog';

const SERVICE_TITLES = SERVICE_CATEGORY_ORDER.map((c) => c.label);

export function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return (
    <div className="marketing-page marketing-page--minimal">
      <header className="marketing-bar marketing-bar--minimal">
        <div className="marketing-bar-inner marketing-bar-inner--minimal">
          <Link to="/clinic" className="marketing-brand brand-logo--nav" aria-label="Clarity Dental Clinic">
            <BrandLogo variant="horizontal" density="compact" />
          </Link>
          <nav className="marketing-nav-links marketing-nav-links--minimal" aria-label="Primary">
            <a className="marketing-nav-a" href="#services">
              Services
            </a>
            <a className="marketing-nav-a" href="#branches">
              Locations
            </a>
            <a className="marketing-nav-a" href="#contact">
              Contact
            </a>
            <Link className="btn btn-primary btn-sm marketing-nav-btn" to="/?next=/patient/book">
              Book appointment
            </Link>
            <Link className="btn btn-secondary btn-sm marketing-nav-btn marketing-nav-btn--outline" to="/">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="marketing-hero marketing-hero--minimal">
        <div className="marketing-hero-inner marketing-hero-inner--minimal">
          <h1 className="marketing-hero-title font-serif">Comprehensive Dental Care with Clarity, Comfort, and Precision</h1>
          <p className="marketing-hero-tag">Specialist-led care in a calm, modern setting.</p>
          <div className="marketing-hero-actions marketing-hero-actions--minimal">
            <Link className="btn btn-primary marketing-hero-cta-primary" to="/?next=/patient/book">
              Book appointment
            </Link>
            <Link className="btn btn-secondary marketing-hero-cta-secondary" to="/">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="marketing-section marketing-section--minimal">
        <div className="marketing-section-inner">
          <h2 className="marketing-section-head font-serif">Services</h2>
          <ul className="marketing-service-list">
            {SERVICE_TITLES.map((title) => (
              <li key={title} className="marketing-service-line">
                {title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="branches" className="marketing-section marketing-section--alt marketing-section--minimal">
        <div className="marketing-section-inner">
          <h2 className="marketing-section-head font-serif">Locations</h2>
          <div className="marketing-branches marketing-branches--minimal">
            {CLINIC.branches.map((b) => (
              <article key={b.id} className="marketing-branch-card marketing-branch-card--minimal">
                <h3 className="marketing-branch-name font-serif">{b.name}</h3>
                <p className="marketing-branch-address">{b.address}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="marketing-section marketing-section--minimal">
        <div className="marketing-section-inner marketing-contact--minimal">
          <h2 className="marketing-section-head font-serif">Contact</h2>
          <p className="marketing-contact-line">
            <a href={`tel:${CLINIC.phones[0].replace(/\s/g, '')}`}>{CLINIC.phones[0]}</a>
            <span className="marketing-contact-sep">·</span>
            <a href={`tel:${CLINIC.phones[1].replace(/\s/g, '')}`}>{CLINIC.phones[1]}</a>
          </p>
          <p className="marketing-contact-line">
            <a href={CLINIC.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </p>
          <p className="marketing-contact-owner muted">{CLINIC.owner}</p>
        </div>
      </section>

      <footer className="marketing-footer marketing-footer--minimal">
        <div className="marketing-footer-inner marketing-footer-inner--minimal">
          <span className="font-serif marketing-footer-brand">{CLINIC.name}</span>
          <span className="muted">Giza, Egypt</span>
          <Link to="/" className="marketing-footer-link">
            Sign in
          </Link>
          <Link to="/?portal=staff" className="marketing-footer-link">
            Staff workspace
          </Link>
          <Link to="/?next=/patient/book" className="marketing-footer-link">
            Book
          </Link>
        </div>
      </footer>
    </div>
  );
}
