import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney, todayISODate } from '../../utils/format';

export function RecordPaymentAssistant() {
  const { user } = useAuth();
  const { state, recordStaffPayment } = useAppData();
  const open = state.invoices.filter((i) => i.status !== 'Paid');
  const [invoiceId, setInvoiceId] = useState(open[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [date, setDate] = useState(todayISODate());

  const submit = (e) => {
    e.preventDefault();
    if (!invoiceId || !amount) return;
    recordStaffPayment({ invoiceId, amount: Number(amount), method, date, recordedBy: user.id });
    setAmount('');
  };

  return (
    <div>
      <h1 className="page-title font-serif">Record payment</h1>
      <p className="page-sub">Front-desk payment capture updates AR and invoice status.</p>
      <form className="card" style={{ maxWidth: 480 }} onSubmit={submit}>
        <div className="form-row">
          <label>Invoice</label>
          <select
            className="select"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            disabled={!open.length}
          >
            {!open.length ? <option value="">No open invoices</option> : null}
            {open.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} — {state.patients.find((p) => p.id === i.patientId)?.fullName} — bal {formatMoney(i.amount - (i.amountPaid || 0))}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Amount</label>
          <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Method</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Cash</option>
            <option>Card</option>
            <option>Transfer</option>
          </select>
        </div>
        <div className="form-row">
          <label>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!open.length}>
          Confirm payment
        </button>
      </form>
    </div>
  );
}
