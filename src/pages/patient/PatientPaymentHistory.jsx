import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney, formatDate } from '../../utils/format';

export function PatientPaymentHistory() {
  const { user } = useAuth();
  const { state } = useAppData();
  const rows = state.payments.filter((p) => p.patientId === user.id);

  return (
    <div>
      <h1 className="page-title font-serif">Payment history</h1>
      <p className="page-sub">Ledger of portal and front-desk recorded payments.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.invoiceId}</td>
                <td>{formatDate(p.date)}</td>
                <td>{p.method}</td>
                <td>{formatMoney(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty-state">No payments yet.</div> : null}
      </div>
    </div>
  );
}
