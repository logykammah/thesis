import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { formatMoney, formatDate } from '../../utils/format';
import { formatPriceRange } from '../../data/serviceCatalog';
import { branchNameFromState } from '../../utils/branch';

function isPendingEstimate(inv) {
  return Boolean(inv.visitPending) || inv.status === 'Pending';
}

export function PatientInvoices() {
  const { user } = useAuth();
  const { state } = useAppData();
  const invoices = state.invoices.filter((i) => i.patientId === user.id);
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <h1 className="page-title font-serif">Invoices</h1>
      <p className="page-sub">Treatment invoices and payment status.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Branch</th>
              <th>Dentist</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{branchNameFromState(state, inv.branchId)}</td>
                <td>{state.dentists.find((d) => d.id === inv.dentistId)?.fullName || '—'}</td>
                <td>{formatDate(inv.date)}</td>
                <td>{isPendingEstimate(inv) ? '—' : formatMoney(inv.subtotal ?? inv.amount)}</td>
                <td>
                  <Badge status={inv.status}>{inv.status}</Badge>
                </td>
                <td>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(inv)}>
                    View invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 ? <div className="empty-state">No invoices yet.</div> : null}
      </div>

      <Modal title={selected ? `Invoice ${selected.id}` : ''} open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div>
            <p className="muted">
              Issued {formatDate(selected.date)} · {branchNameFromState(state, selected.branchId)} ·{' '}
              {state.dentists.find((d) => d.id === selected.dentistId)?.fullName || '—'}
            </p>
            {isPendingEstimate(selected) ? (
              <div className="card" style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--color-panel-alt, #f5f7fa)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Pending</p>
                <p className="muted" style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.92rem' }}>
                  Final treatment and cost will be determined after your visit.
                </p>
              </div>
            ) : (
              <>
                <table className="data-table" style={{ marginTop: '0.75rem' }}>
                  <tbody>
                    {selected.lines.map((ln, idx) => (
                      <tr key={idx}>
                        <td>
                          {ln.label}
                          {ln.priceMin != null && ln.priceMax != null ? (
                            <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                              Typical range: {formatPriceRange(ln)}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          {ln.qty} × {formatMoney(ln.unitPrice)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(ln.qty * ln.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex-between mt-md">
                  <span>Subtotal</span>
                  <strong>{formatMoney(selected.subtotal ?? selected.amount)}</strong>
                </div>
                <div className="flex-between">
                  <span>Total</span>
                  <strong>{formatMoney(selected.amount)}</strong>
                </div>
                <div className="flex-between">
                  <span>Paid</span>
                  <strong>{formatMoney(selected.amountPaid || 0)}</strong>
                </div>
                <div className="flex-between">
                  <span>Balance</span>
                  <strong>{formatMoney(selected.amount - (selected.amountPaid || 0))}</strong>
                </div>
              </>
            )}
            <p className="mt-md">
              <Badge status={selected.status}>{selected.status}</Badge>
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
