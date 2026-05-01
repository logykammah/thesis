import { useEffect, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';

export function UpdatePatientInfo() {
  const { state, updatePatient } = useAppData();
  const [id, setId] = useState(state.patients[0]?.id);
  const p = state.patients.find((x) => x.id === id);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const pt = state.patients.find((x) => x.id === id);
    if (!pt) return;
    setPhone(pt.phone || '');
    setEmail(pt.email || '');
    setAddress(pt.address || '');
    setEmergencyName(pt.emergencyContact?.name || '');
    setEmergencyRelation(pt.emergencyContact?.relation || '');
    setEmergencyPhone(pt.emergencyContact?.phone || '');
    setNotes(pt.notes || '');
  }, [id, state.patients]);

  const save = () => {
    updatePatient(id, {
      phone,
      email,
      address,
      notes,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
    });
  };

  return (
    <div>
      <h1 className="page-title font-serif">Edit patient details</h1>
      <p className="page-sub">
        Update contact and administrative information only — not appointments. Scheduling lives under{' '}
        <strong>Appointments</strong>.
      </p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="form-row">
          <label>Patient</label>
          <select className="select" value={id} onChange={(e) => setId(e.target.value)}>
            {state.patients.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.fullName} · {pt.id}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-2">
          <div className="form-row">
            <label>Phone</label>
            <input className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-row" style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Emergency contact name</label>
            <input className="input" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Relation</label>
            <input className="input" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Emergency contact phone</label>
            <input className="input" inputMode="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          </div>
          <div className="form-row" style={{ gridColumn: '1 / -1' }}>
            <label>Administrative / medical notes</label>
            <textarea className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          Save patient details
        </button>
        {p ? (
          <p className="muted mt-md" style={{ fontSize: '0.82rem' }}>
            Name &amp; DOB are chart identifiers — contact reception or clinical lead to correct legal identity data.
          </p>
        ) : null}
      </div>
    </div>
  );
}
