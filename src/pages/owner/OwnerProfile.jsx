import { CLINIC } from '../../data/initialState';
import { BrandLogo } from '../../components/BrandLogo';

export function OwnerProfile() {
  return (
    <div className="grid grid-2">
      <div className="card" style={{ background: 'linear-gradient(160deg, var(--color-primary), var(--color-primary-dark))', color: '#f8fafc' }}>
        <div className="flex gap-md" style={{ alignItems: 'center' }}>
          <BrandLogo variant="horizontal" />
          <div>
            <h1 className="font-serif" style={{ margin: 0, fontSize: '1.75rem' }}>
              {CLINIC.owner}
            </h1>
            <div style={{ opacity: 0.9 }}>Clinic Owner</div>
            <div style={{ opacity: 0.85, marginTop: '0.35rem' }}>{CLINIC.name}</div>
          </div>
        </div>
        <p style={{ marginTop: '1.25rem', lineHeight: 1.6, opacity: 0.95 }}>
          Multi-site operator focused on evidence-based dentistry, disciplined operations, and a calm patient experience across Dokki and
          Sheikh Zayed.
        </p>
        <p style={{ marginTop: '0.75rem' }}>Mobile: {CLINIC.phones[0]}</p>
        <p>Landline: {CLINIC.phones[1]}</p>
        <p style={{ marginTop: '0.75rem' }}>
          <a href={CLINIC.facebook} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>
            Facebook — Clarity Dental Clinic
          </a>
        </p>
      </div>
      <div className="card">
        <h2 className="card-title">Branches</h2>
        <div className="grid grid-2" style={{ gap: '0.75rem' }}>
          {CLINIC.branches.map((b) => (
            <div key={b.id} className="card" style={{ padding: '1rem', boxShadow: 'none', border: '1px solid var(--color-border)' }}>
              <div className="font-serif" style={{ fontSize: '1.1rem' }}>
                {b.name}
              </div>
              <p className="muted" style={{ fontSize: '0.88rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                {b.address}
              </p>
            </div>
          ))}
        </div>
        <h2 className="card-title mt-md">Clinic summary</h2>
        <p>
          Clarity Dental Clinic pairs specialist-led care with a digitally supported front office: branch-aware scheduling, inventory tied
          to each site, and transparent billing for patients and ownership.
        </p>
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          The same standards apply across both locations: coordinated care, transparent billing, and accountable operations.
        </p>
      </div>
    </div>
  );
}
