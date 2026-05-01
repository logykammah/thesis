import { useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney, formatDate } from '../../utils/format';

export function PaymentMonitoring() {
  const { state } = useAppData();

  const patientById = useMemo(() => {
    const m = {};
    state.patients.forEach((p) => {
      m[p.id] = p.fullName;
    });
    return m;
  }, [state.patients]);

  const paymentsSorted = useMemo(() => {
    return [...state.payments].sort((a, b) => {
      const dc = (b.date || '').localeCompare(a.date || '');
      if (dc !== 0) return dc;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [state.payments]);

  return (
    <div className="owner-payments-page">
      <div className="owner-payments-page__hero">
        <h1 className="page-title font-serif owner-payments-page__title">Payment monitoring</h1>
        <p className="page-sub owner-payments-page__lead">
          Cash and transfers already received — a chronological ledger of completed patient payments (not amounts still owed).
        </p>
      </div>

      <div className="table-wrap owner-payments-page__table-wrap">
        <table className="data-table owner-payments-table">
          <thead>
            <tr>
              <th>Patient name</th>
              <th>Invoice ID</th>
              <th>Payment date</th>
              <th>Amount paid</th>
              <th>Payment method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentsSorted.map((p) => (
              <tr key={p.id}>
                <td>{patientById[p.patientId] || p.patientId}</td>
                <td>
                  <span className="owner-payments-table__invoice">{p.invoiceId}</span>
                </td>
                <td>{formatDate(p.date)}</td>
                <td>
                  <strong className="owner-payments-table__amount">{formatMoney(p.amount)}</strong>
                </td>
                <td>{p.method}</td>
                <td>
                  <span className="owner-payments-status">{p.status || 'Completed'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paymentsSorted.length === 0 ? <div className="empty-state">No payments recorded yet.</div> : null}
      </div>
    </div>
  );
}
