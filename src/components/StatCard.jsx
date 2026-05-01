export function StatCard({ label, value, hint }) {
  return (
    <div className="card card-hover">
      <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: '1.65rem', marginTop: '0.25rem' }}>
        {value}
      </div>
      {hint ? (
        <div className="muted mt-sm" style={{ fontSize: '0.8rem' }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
