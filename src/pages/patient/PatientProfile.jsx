import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { formatDate } from '../../utils/format';
import { BRANCHES } from '../../data/clinicMeta';

const PDF_ACCEPT = '.pdf,application/pdf';

function emptyForm() {
  return {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    preferredBranchId: '',
    medicalAttachment: null,
  };
}

export function PatientProfile() {
  const { user } = useAuth();
  const { state, updatePatient } = useAppData();
  const patient = state.patients.find((p) => p.id === user?.id);

  const mySmilePreviews = useMemo(() => {
    if (!patient) return [];
    const list = state.smilePreviews || [];
    return list
      .filter((s) => s.patientId === patient.id)
      .slice()
      .sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
  }, [state.smilePreviews, patient]);

  const myPostTreatment = useMemo(() => {
    if (!patient) return [];
    return (state.postTreatmentCare || [])
      .filter((r) => r.patientId === patient.id)
      .slice()
      .sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
  }, [state.postTreatmentCare, patient]);

  const [form, setForm] = useState(emptyForm);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!patient) return;
    const att = patient.medicalAttachment || null;
    setForm({
      fullName: patient.fullName ?? '',
      email: patient.email ?? '',
      phone: patient.phone ?? '',
      dob: patient.dob ?? '',
      gender: patient.gender ?? '',
      address: patient.address ?? '',
      bloodType: patient.bloodType ?? '',
      allergies: patient.allergies ?? '',
      chronicConditions: patient.chronicConditions ?? '',
      emergencyName: patient.emergencyContact?.name ?? '',
      emergencyRelation: patient.emergencyContact?.relation ?? '',
      emergencyPhone: patient.emergencyContact?.phone ?? '',
      preferredBranchId: patient.preferredBranchId ?? '',
      medicalAttachment: att,
    });
    setFileError('');
  }, [patient]);

  const attachmentLabel = form.medicalAttachment?.fileName ?? '';

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;
    if (!file.type.includes('pdf')) {
      setFileError('Please upload a PDF file only.');
      e.target.value = '';
      return;
    }
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      setFileError(`Maximum file size is ${maxMb} MB.`);
      e.target.value = '';
      return;
    }
    setField('medicalAttachment', {
      fileName: file.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      sizeBytes: file.size,
    });
    e.target.value = '';
  };

  const removeAttachment = () => {
    setField('medicalAttachment', null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = (e) => {
    e.preventDefault();
    if (!patient) return;
    updatePatient(patient.id, {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dob: form.dob,
      gender: form.gender,
      address: form.address.trim(),
      bloodType: form.bloodType.trim(),
      allergies: form.allergies.trim(),
      chronicConditions: form.chronicConditions.trim(),
      emergencyContact: {
        name: form.emergencyName.trim(),
        relation: form.emergencyRelation.trim(),
        phone: form.emergencyPhone.trim(),
      },
      preferredBranchId: form.preferredBranchId || null,
      medicalAttachment: form.medicalAttachment || null,
    });
  };

  if (!patient) {
    return <div className="empty-state">Patient profile could not be loaded.</div>;
  }

  return (
    <div className="patient-profile-page">
      <h1 className="page-title font-serif">Profile</h1>
      <p className="page-sub">Keep your details up to date for appointments and clinical care.</p>

      <form className="patient-profile-layout" onSubmit={submit}>
        <div className="card patient-profile-card">
          <span className="patient-profile-id muted" style={{ fontSize: '0.85rem' }}>
            Patient ID · {patient.id}
          </span>

          <h2 className="patient-profile-section-title">Personal & contact</h2>
          <div className="patient-profile-fields">
            <label className="form-row">
              Full name
              <input className="input" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
            </label>
            <label className="form-row">
              Email
              <input type="email" className="input" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </label>
            <label className="form-row">
              Phone
              <input className="input" inputMode="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </label>
            <label className="form-row">
              Address
              <input className="input" value={form.address} onChange={(e) => setField('address', e.target.value)} />
            </label>
          </div>

          <h2 className="patient-profile-section-title mt-md">Basic info</h2>
          <div className="patient-profile-fields patient-profile-fields--split">
            <label className="form-row">
              Date of birth
              <input type="date" className="input" value={form.dob} onChange={(e) => setField('dob', e.target.value)} />
            </label>
            <label className="form-row">
              Gender
              <select className="select" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                <option value="">Select…</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
          </div>
          <label className="form-row mt-sm">
            National ID
            <input className="input" readOnly value={patient.nationalId} title="Registered with the clinic" />
          </label>

          <h2 className="patient-profile-section-title mt-md">Preferred branch</h2>
          <p className="muted patient-profile-hint">Where you prefer to attend when booking.</p>
          <label className="form-row">
            Preferred branch
            <select className="select" value={form.preferredBranchId} onChange={(e) => setField('preferredBranchId', e.target.value)}>
              <option value="">No preference</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortName}
                </option>
              ))}
            </select>
          </label>

          <h2 className="patient-profile-section-title mt-md">Health summary</h2>
          <div className="patient-profile-fields patient-profile-fields--split">
            <label className="form-row">
              Blood type
              <input className="input" value={form.bloodType} onChange={(e) => setField('bloodType', e.target.value)} />
            </label>
            <label className="form-row">
              Allergies
              <input className="input" value={form.allergies} onChange={(e) => setField('allergies', e.target.value)} placeholder="None known" />
            </label>
          </div>
          <label className="form-row mt-sm">
            Chronic conditions
            <input className="input" value={form.chronicConditions} onChange={(e) => setField('chronicConditions', e.target.value)} placeholder="None" />
          </label>

          <h2 className="patient-profile-section-title mt-md">Emergency contact</h2>
          <div className="patient-profile-fields patient-profile-fields--split">
            <label className="form-row">
              Name
              <input className="input" value={form.emergencyName} onChange={(e) => setField('emergencyName', e.target.value)} />
            </label>
            <label className="form-row">
              Relation
              <input className="input" value={form.emergencyRelation} onChange={(e) => setField('emergencyRelation', e.target.value)} />
            </label>
          </div>
          <label className="form-row mt-sm">
            Phone
            <input className="input" inputMode="tel" value={form.emergencyPhone} onChange={(e) => setField('emergencyPhone', e.target.value)} />
          </label>

          <h2 className="patient-profile-section-title mt-md">Medical Information (Optional)</h2>
          <p className="muted patient-profile-helper">
            You can upload your medical documents to help your dentist better understand your condition.
          </p>

          <input
            id="patient-medical-pdf"
            ref={fileInputRef}
            type="file"
            accept={PDF_ACCEPT}
            className="patient-profile-file-input"
            onChange={handleFileChange}
          />

          {!attachmentLabel ? (
            <button type="button" className="patient-profile-upload-zone" onClick={handleFilePick}>
              <span className="patient-profile-upload-icon" aria-hidden>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6M12 11v9M9 14l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="patient-profile-upload-title">Upload PDF</span>
              <span className="muted patient-profile-upload-caption">Upload medical reports, x-rays, or history (optional)</span>
            </button>
          ) : (
            <div className="patient-profile-file-row">
              <div className="patient-profile-file-chip card">
                <span className="patient-profile-file-name">{attachmentLabel}</span>
                {form.medicalAttachment?.uploadedAt ? (
                  <span className="muted patient-profile-file-meta">Uploaded {form.medicalAttachment.uploadedAt}</span>
                ) : null}
                <div className="patient-profile-file-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleFilePick}>
                    Replace PDF
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={removeAttachment}>
                    Remove file
                  </button>
                </div>
              </div>
            </div>
          )}

          {fileError ? <p className="patient-profile-file-error">{fileError}</p> : null}

          <div className="patient-profile-actions mt-md">
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </form>

      <div className="card patient-profile-card mt-md">
        <h2 className="patient-profile-section-title">Post-treatment instructions</h2>
        <p className="muted patient-profile-hint" style={{ marginBottom: '1rem' }}>
          Follow-up care added by your clinician after treatment. Contact the clinic if you notice any warning signs listed
          below.
        </p>
        {myPostTreatment.length === 0 ? (
          <p className="muted">No saved post-treatment packets yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myPostTreatment.map((row) => (
              <div key={row.id} style={{ padding: '0.85rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg)' }}>
                <div className="flex-between gap-sm" style={{ flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <span className="muted" style={{ fontSize: '0.82rem' }}>
                    {formatDate(row.createdDate)} · {state.dentists.find((d) => d.id === row.dentistId)?.fullName || 'Clinician'}
                  </span>
                  {row.sentToPatient ? (
                    <span className="badge badge-confirmed" style={{ fontSize: '0.65rem' }}>
                      Sent to portal
                    </span>
                  ) : null}
                </div>
                {row.careNotes ? (
                  <p style={{ margin: '0.35rem 0', fontSize: '0.9rem' }}>
                    <strong>Care:</strong> {row.careNotes}
                  </p>
                ) : null}
                {row.warnings ? (
                  <p style={{ margin: '0.35rem 0', fontSize: '0.88rem', color: '#92400e' }}>
                    <strong>Watch for:</strong> {row.warnings}
                  </p>
                ) : null}
                {row.attachmentFileName ? (
                  <p className="muted" style={{ fontSize: '0.8rem', margin: '0.35rem 0 0' }}>
                    Attachment (reference): {row.attachmentFileName}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card patient-profile-card mt-md">
        <h2 className="patient-profile-section-title">Consultation smile previews</h2>
        <p className="muted patient-profile-hint" style={{ marginBottom: '1rem' }}>
          Your dentist may save AI-assisted visual previews here after a consultation. These support discussion only and are
          not a final treatment plan or guaranteed result.
        </p>
        {mySmilePreviews.length === 0 ? (
          <p className="muted">No saved smile previews yet.</p>
        ) : (
          <div className="patient-smile-preview-list">
            {mySmilePreviews.map((s) => {
              const dentist = state.dentists.find((d) => d.id === s.dentistId);
              return (
                <div key={s.id} className="patient-smile-preview-item">
                  <div className="patient-smile-preview-item__meta">
                    <strong>{s.procedure}</strong>
                    <span className="muted">
                      {formatDate(s.createdDate)} · {dentist?.fullName || 'Clinician'}
                    </span>
                  </div>
                  <div className="patient-smile-preview-item__compare">
                    <div>
                      <span className="patient-smile-preview-item__label">Before</span>
                      <img src={s.beforeDataUrl} alt="" className="patient-smile-preview-item__img" />
                    </div>
                    <div>
                      <span className="patient-smile-preview-item__label">Preview</span>
                      <img src={s.afterDataUrl} alt="" className="patient-smile-preview-item__img" />
                    </div>
                  </div>
                  {s.disclaimer ? <p className="patient-smile-preview-item__disclaimer muted">{s.disclaimer}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

