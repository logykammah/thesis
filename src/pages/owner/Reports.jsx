import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';

export function Reports() {
  const { state } = useAppData();
  const [branchFilter, setBranchFilter] = useState('all');

  const scopedAppts = useMemo(() => {
    return state.appointments.filter((a) => branchFilter === 'all' || a.branchId === branchFilter);
  }, [state.appointments, branchFilter]);

  const scopedTreatments = useMemo(() => {
    return state.treatmentRecords.filter((t) => branchFilter === 'all' || t.branchId === branchFilter);
  }, [state.treatmentRecords, branchFilter]);

  const scopedPayments = useMemo(() => {
    return state.payments.filter((p) => branchFilter === 'all' || p.branchId === branchFilter);
  }, [state.payments, branchFilter]);

  const apptStats = useMemo(() => {
    const m = {};
    scopedAppts.forEach((a) => {
      m[a.status] = (m[a.status] || 0) + 1;
    });
    return m;
  }, [scopedAppts]);

  const maxAppt = Math.max(...Object.values(apptStats), 1);

  const topTreatments = useMemo(() => {
    const counts = {};
    scopedTreatments.forEach((t) => {
      counts[t.procedureType] = (counts[t.procedureType] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [scopedTreatments]);

  const scopedAr = useMemo(() => {
    return state.accountsReceivable.filter((a) => branchFilter === 'all' || a.branchId === branchFilter);
  }, [state.accountsReceivable, branchFilter]);

  return (
    <div>
      <h1 className="page-title font-serif">Reports</h1>
      <p className="page-sub">Operational analytics with optional branch scope for leadership review.</p>

      <div className="toolbar mb-md">
        <label className="muted" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>
          Branch
        </label>
        <select className="select" style={{ maxWidth: 220 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All branches</option>
          {state.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {scopedAppts.length} appointments in scope
        </span>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Appointments by status</h2>
          <div className="chart-bar-wrap">
            {Object.entries(apptStats).map(([k, v]) => (
              <div key={k} className="chart-bar" style={{ height: `${(v / maxAppt) * 100}%` }}>
                <span>{k}</span>
              </div>
            ))}
          </div>
          <div className="muted mt-md" style={{ fontSize: '0.85rem' }}>
            Includes scheduled, in-clinic, and terminal outcomes for {branchFilter === 'all' ? 'both sites' : branchNameFromState(state, branchFilter)}.
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Revenue & collection (scoped)</h2>
          <p>
            Payments logged: <strong>{formatMoney(scopedPayments.reduce((s, p) => s + p.amount, 0))}</strong>
          </p>
          <p>
            Open AR: <strong>{formatMoney(scopedAr.reduce((s, a) => s + a.outstanding, 0))}</strong>
          </p>
          <p>
            Low-stock SKUs:{' '}
            <strong>
              {
                state.inventory.filter(
                  (i) => i.status !== 'OK' && (branchFilter === 'all' || i.branchId === branchFilter),
                ).length
              }
            </strong>
          </p>
        </div>
      </div>
      <div className="card mt-md">
        <h2 className="card-title">Top performed treatments</h2>
        <ul>
          {topTreatments.length ? (
            topTreatments.map(([name, n]) => (
              <li key={name}>
                {name} — {n} record(s)
              </li>
            ))
          ) : (
            <li className="muted">No treatments in this branch scope.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
