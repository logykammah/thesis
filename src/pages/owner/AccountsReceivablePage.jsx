import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney, formatDate, todayISODate } from '../../utils/format';
import { SearchBar } from '../../components/SearchBar';

export function AccountsReceivablePage() {
  const { state } = useAppData();
  const [q, setQ] = useState('');
  const today = todayISODate();

  const patientById = useMemo(() => {
    const m = {};
    state.patients.forEach((p) => {
      m[p.id] = p.fullName;
    });
    return m;
  }, [state.patients]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.invoices
      .filter((inv) => {
        if (inv.visitPending || inv.status === 'Pending') return false;
        const total = inv.amount || 0;
        if (total <= 0) return false;
        const paid = inv.amountPaid || 0;
        const remaining = Math.max(0, total - paid);
        if (remaining <= 0) return false;
        const name = patientById[inv.patientId]?.toLowerCase() || '';
        return !needle || name.includes(needle) || inv.id.toLowerCase().includes(needle);
      })
      .map((inv) => {
        const total = inv.amount || 0;
        const paid = inv.amountPaid || 0;
        const remaining = Math.max(0, total - paid);
        const due = inv.dueDate || '';
        const overdue = due && due < today;
        const rowStatus = paid <= 0 ? 'Unpaid' : 'Partially Paid';
        return {
          key: inv.id,
          patientName: patientById[inv.patientId] || inv.patientId,
          invoiceId: inv.id,
          total,
          paid,
          remaining,
          rowStatus,
          dueDate: inv.dueDate,
          overdue,
        };
      })
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });
  }, [state.invoices, patientById, q, today]);

  return (
    <div className="owner-ar-page">
      <div className="owner-ar-page__banner">
        <div>
          <h1 className="page-title font-serif owner-ar-page__title">Accounts receivable</h1>
          <p className="page-sub owner-ar-page__lead">
            Money patients still owe — unpaid and partially paid invoices only. Fully settled invoices do not appear here.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Filter by patient or invoice ID" />
      </div>

      <div className="table-wrap owner-ar-page__table-wrap">
        <table className="data-table owner-ar-table">
          <thead>
            <tr>
              <th>Patient name</th>
              <th>Invoice ID</th>
              <th>Total amount</th>
              <th>Paid amount</th>
              <th>Remaining amount</th>
              <th>Status</th>
              <th>Due date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={r.overdue ? 'owner-ar-table__row--overdue' : undefined}>
                <td>{r.patientName}</td>
                <td>
                  <span className="owner-ar-table__invoice">{r.invoiceId}</span>
                </td>
                <td>{formatMoney(r.total)}</td>
                <td>{formatMoney(r.paid)}</td>
                <td>
                  <strong className="owner-ar-table__remaining">{formatMoney(r.remaining)}</strong>
                </td>
                <td>
                  <span
                    className={`owner-ar-badge ${r.rowStatus === 'Unpaid' ? 'owner-ar-badge--unpaid' : 'owner-ar-badge--partial'}`}
                  >
                    {r.rowStatus}
                  </span>
                </td>
                <td>
                  {formatDate(r.dueDate)}
                  {r.overdue ? <span className="owner-ar-overdue-tag"> Overdue</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div className="empty-state">No outstanding balances — all invoices are fully paid or not yet billed.</div>
        ) : null}
      </div>
    </div>
  );
}
