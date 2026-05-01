import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney } from '../../utils/format';
import { SERVICE_CATEGORY_ORDER, formatPriceRange } from '../../data/serviceCatalog';

export function GenerateInvoice() {
  const { state, generateInvoice } = useAppData();
  const rates = state.serviceRates;
  const firstPatientId = state.patients[0]?.id;
  const [patientId, setPatientId] = useState(firstPatientId);
  const treatments = useMemo(() => state.treatmentRecords.filter((t) => t.patientId === patientId), [state.treatmentRecords, patientId]);
  const [treatmentId, setTreatmentId] = useState(
    () => state.treatmentRecords.find((t) => t.patientId === firstPatientId)?.id ?? '',
  );
  const [code, setCode] = useState(rates[0]?.code || '');
  const [branchId, setBranchId] = useState(state.branches[0]?.id || '');
  const [dentistId, setDentistId] = useState('');

  const selTreatmentId = treatments.some((t) => t.id === treatmentId) ? treatmentId : treatments[0]?.id ?? '';
  const selTr = state.treatmentRecords.find((t) => t.id === selTreatmentId);

  const providerId = dentistId || selTr?.dentistId || state.dentists[0]?.id;

  const preview = rates.find((r) => r.code === code);

  return (
    <div>
      <h1 className="page-title font-serif">Generate invoice</h1>
      <p className="page-sub">Branch, provider, treatment link, and service catalog — AR updates automatically.</p>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="form-row">
          <label>Patient</label>
          <select
            className="select"
            value={patientId}
            onChange={(e) => {
              const pid = e.target.value;
              setPatientId(pid);
              const first = state.treatmentRecords.filter((t) => t.patientId === pid)[0];
              setTreatmentId(first?.id ?? '');
            }}
          >
            {state.patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Linked treatment</label>
          <select
            className="select"
            value={selTreatmentId}
            onChange={(e) => {
              const id = e.target.value;
              setTreatmentId(id);
              const tr = state.treatmentRecords.find((t) => t.id === id);
              if (tr?.branchId) setBranchId(tr.branchId);
              if (tr?.dentistId) setDentistId(tr.dentistId);
            }}
            disabled={!treatments.length}
          >
            {!treatments.length ? <option value="">No treatments for patient</option> : null}
            {treatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.procedureType}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-2">
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>Branch (on invoice)</label>
            <select className="select" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              {state.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>Treating dentist</label>
            <select className="select" value={providerId} onChange={(e) => setDentistId(e.target.value)}>
              {state.dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <label>Service line</label>
          <select className="select" value={code} onChange={(e) => setCode(e.target.value)}>
            {SERVICE_CATEGORY_ORDER.map((cat) => {
              const rows = rates.filter((r) => r.categoryId === cat.id);
              if (!rows.length) return null;
              return (
                <optgroup key={cat.id} label={cat.label}>
                  {rows.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label} — {formatMoney(r.price)} ({formatPriceRange(r)})
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        <p>
          Invoice line (typical): <strong>{formatMoney(preview?.price || 0)}</strong>
        </p>
        {preview ? (
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '-0.25rem' }}>
            Egypt market band: {formatPriceRange(preview)} · final fee depends on case complexity.
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selTreatmentId}
          onClick={() =>
            generateInvoice({
              patientId,
              treatmentRecordId: selTreatmentId,
              serviceCode: code,
              branchId,
              dentistId: providerId,
            })
          }
        >
          Generate invoice
        </button>
      </div>
    </div>
  );
}
