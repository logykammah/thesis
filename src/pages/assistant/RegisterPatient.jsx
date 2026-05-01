import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';

const empty = {
  fullName: '',
  nationalId: '',
  dob: '',
  gender: 'Female',
  phone: '',
  email: '',
  address: '',
  bloodType: '',
  allergies: '',
  chronicConditions: '',
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
  notes: '',
  medicalAttachment: null,
};

const label = (k) =>
  ({
    fullName: 'Full name',
    dob: 'Date of birth',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    emergencyName: 'Emergency contact name',
    emergencyPhone: 'Emergency contact phone',
  }[k] || k);

export function RegisterPatient() {
  const { registerPatient } = useAppData();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);
  const [clinicalOpen, setClinicalOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const reqs = ['fullName', 'dob', 'phone', 'email', 'address', 'emergencyName', 'emergencyPhone'];
    const errs = reqs.filter((k) => !form[k]?.trim()).map((k) => `${label(k)} is required`);
    setErrors(errs);
    if (errs.length) return;
    const res = registerPatient(form);
    if (res?.ok) setForm(empty);
  };

  return (
    <div>
      <h1 className="page-title font-serif">Register patient</h1>
      <p className="page-sub">
        Quick demographics first — clinical details stay optional until triage or first visit. New IDs join the unified patient
        ledger (Dokki · Zayed) — search by name or ID from any branch.
      </p>
      {errors.length ? (
        <div className="card mb-md" style={{ borderColor: '#f5c2c2', background: '#fff5f5' }}>
          {errors.map((err) => (
            <div key={err}>{err}</div>
          ))}
        </div>
      ) : null}
      <form className="card register-patient-form" onSubmit={submit}>
        <h2 className="card-title" style={{ fontSize: '1.05rem' }}>
          Patient details
        </h2>
        <div className="grid grid-2">
          <div className="form-row">
            <label>Full name</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="form-row">
            <label>Date of birth</label>
            <input className="input" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </div>
          <div className="form-row">
            <label>Gender</label>
            <select className="select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input className="input" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-row" style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-row">
            <label>Emergency contact name</label>
            <input className="input" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} />
          </div>
          <div className="form-row">
            <label>Emergency contact relation</label>
            <input
              className="input"
              placeholder="Optional"
              value={form.emergencyRelation}
              onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>Emergency contact phone</label>
            <input className="input" inputMode="tel" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} />
          </div>
        </div>

        <button type="button" className="btn btn-ghost btn-sm mt-md mb-sm" onClick={() => setClinicalOpen((o) => !o)}>
          {clinicalOpen ? '▼ Hide optional clinical / documents' : '▸ Optional clinical & documents'}
        </button>

        {clinicalOpen ? (
          <div className="register-patient-optional card" style={{ background: 'var(--color-surface-muted, #f8fafc)' }}>
            <div className="grid grid-2">
              <div className="form-row">
                <label>National ID (optional)</label>
                <input className="input" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Blood type</label>
                <input className="input" placeholder="e.g. O+" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Allergies</label>
                <input className="input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Chronic disease</label>
                <input className="input" value={form.chronicConditions} onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })} />
              </div>
              <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea className="textarea" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                <label>Attach document (optional)</label>
                <input
                  className="input"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setForm({ ...form, medicalAttachment: f ? f.name : null });
                  }}
                />
                <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  Demo stores filename only; production would upload securely to the patient chart.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <button type="submit" className="btn btn-primary mt-md">
          Register patient
        </button>
      </form>
    </div>
  );
}
