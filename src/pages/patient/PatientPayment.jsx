import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney } from '../../utils/format';

function isPayableInvoice(i) {
  if (i.visitPending || i.status === 'Pending') return false;
  const due = (i.amount || 0) - (i.amountPaid || 0);
  return due > 0;
}

export function PatientPayment() {
  const { user } = useAuth();
  const { state, makePatientPayment } = useAppData();
  const open = useMemo(
    () => state.invoices.filter((i) => i.patientId === user.id && isPayableInvoice(i)),
    [state.invoices, user.id],
  );
  const [invoiceId, setInvoiceId] = useState(open[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Card');

  useEffect(() => {
    if (!open.length) {
      setInvoiceId('');
      return;
    }
    if (!open.some((i) => i.id === invoiceId)) setInvoiceId(open[0].id);
  }, [open, invoiceId]);

  const submit = (e) => {
    e.preventDefault();
    if (!invoiceId || !amount) return;
    makePatientPayment({ invoiceId, amount: Number(amount), method });
    setAmount('');
  };

  return (
    <div>
      <h1 className="page-title font-serif">Make payment</h1>
      <p className="page-sub">
        Pay finalized balances after your visit. Pending estimates cannot be paid online until treatment is completed and invoiced.
      </p>
      <form className="card" onSubmit={submit} style={{ maxWidth: 480 }}>
        <div className="form-row">
          <label>Invoice with balance</label>
          <select
            className="select"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            disabled={!open.length}
          >
            {!open.length ? <option value="">No balance due</option> : null}
            {open.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} — balance {formatMoney(i.amount - (i.amountPaid || 0))}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Amount (EGP)</label>
          <input className="input" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Payment method</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Card</option>
            <option>Cash</option>
            <option>Instapay</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!open.length}>
          Confirm payment
        </button>
        {!open.length ? (
          <p className="muted mt-sm">
            Nothing to pay right now. <Link to="/patient/invoices">View invoices</Link> or{' '}
            <Link to="/patient">return to dashboard</Link>.
          </p>
        ) : null}
      </form>
    </div>
  );
}
