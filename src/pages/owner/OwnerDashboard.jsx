import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/StatCard';
import { formatMoney, todayISODate } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';
import { isActivePipelineStatus } from '../../utils/appointments';

export function OwnerDashboard() {
  const { state } = useAppData();

  const totalPayments = useMemo(() => state.payments.reduce((s, p) => s + p.amount, 0), [state.payments]);

  const monthPrefix = useMemo(() => todayISODate().slice(0, 7), []);

  const paymentsThisMonth = useMemo(
    () =>
      state.payments.filter((p) => (p.date || '').startsWith(monthPrefix)).reduce((s, p) => s + p.amount, 0),
    [state.payments, monthPrefix],
  );

  const invoiceCollectionPulse = useMemo(() => {
    const finals = state.invoices.filter((i) => !i.visitPending && i.status !== 'Pending' && (i.amount || 0) > 0);
    const billed = finals.reduce((s, i) => s + i.amount, 0);
    const collected = finals.reduce((s, i) => s + (i.amountPaid || 0), 0);
    const pctCollected = billed > 0 ? Math.min(100, Math.round((collected / billed) * 1000) / 10) : null;
    return { billed, collected, pctCollected };
  }, [state.invoices]);

  const revenueByBranch = useMemo(() => {
    const m = {};
    state.branches.forEach((b) => {
      m[b.id] = 0;
    });
    state.payments.forEach((p) => {
      if (p.branchId) m[p.branchId] = (m[p.branchId] || 0) + p.amount;
    });
    return m;
  }, [state.payments, state.branches]);

  const apptsByBranch = useMemo(() => {
    const m = {};
    state.branches.forEach((b) => {
      m[b.id] = 0;
    });
    state.appointments.forEach((a) => {
      if (a.branchId) m[a.branchId] = (m[a.branchId] || 0) + 1;
    });
    return m;
  }, [state.appointments, state.branches]);

  const apptsByDentist = useMemo(() => {
    const m = {};
    state.appointments.forEach((a) => {
      if (!a.dentistId) return;
      m[a.dentistId] = (m[a.dentistId] || 0) + 1;
    });
    return Object.entries(m)
      .map(([dentistId, count]) => ({
        dentistId,
        name: state.dentists.find((d) => d.id === dentistId)?.fullName || dentistId,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [state.appointments, state.dentists]);

  const arOpen = useMemo(
    () => state.accountsReceivable.filter((a) => a.outstanding > 0).reduce((s, a) => s + a.outstanding, 0),
    [state.accountsReceivable],
  );

  const arByBranch = useMemo(() => {
    const m = {};
    state.branches.forEach((b) => {
      m[b.id] = 0;
    });
    state.accountsReceivable.forEach((r) => {
      if (r.branchId && r.outstanding > 0) m[r.branchId] = (m[r.branchId] || 0) + r.outstanding;
    });
    return m;
  }, [state.accountsReceivable, state.branches]);

  const lowStock = useMemo(() => state.inventory.filter((i) => i.status !== 'OK'), [state.inventory]);
  const lowByBranch = useMemo(() => {
    const m = {};
    state.branches.forEach((b) => {
      m[b.id] = 0;
    });
    lowStock.forEach((i) => {
      if (i.branchId) m[i.branchId] += 1;
    });
    return m;
  }, [lowStock, state.branches]);

  const pendingPo = state.purchaseOrders.filter((p) => p.status === 'Pending Approval').length;
  const pendingPoByBranch = useMemo(() => {
    const m = {};
    state.branches.forEach((b) => {
      m[b.id] = 0;
    });
    state.purchaseOrders
      .filter((p) => p.status === 'Pending Approval')
      .forEach((p) => {
        if (p.branchId) m[p.branchId] += 1;
      });
    return m;
  }, [state.purchaseOrders, state.branches]);

  const submittedRatings = state.ratings.filter((r) => r.submitted);
  const avgRating =
    submittedRatings.reduce((s, r) => s + (r.experienceStars ?? r.stars ?? 0), 0) /
      Math.max(1, submittedRatings.length) || 0;

  const treatmentVolume = state.treatmentRecords.length;
  const invoiceTotals = useMemo(() => state.invoices.reduce((s, i) => s + (i.amount || 0), 0), [state.invoices]);

  const maxBranchRev = Math.max(...Object.values(revenueByBranch), 1);
  const maxDentistAppt = Math.max(...apptsByDentist.map((d) => d.count), 1);

  const activeAppointmentCount = useMemo(
    () => state.appointments.filter((a) => isActivePipelineStatus(a.status)).length,
    [state.appointments],
  );

  const frequentProcedures = useMemo(() => {
    const m = {};
    state.treatmentRecords.forEach((t) => {
      const k = (t.procedureType || '').trim() || 'Unspecified procedure';
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [state.treatmentRecords]);

  const lowStockDentalRows = useMemo(
    () =>
      state.inventory
        .filter((i) => i.status !== 'OK')
        .slice()
        .sort((a, b) => (a.quantity / Math.max(1, a.reorderLevel)) - (b.quantity / Math.max(1, b.reorderLevel)))
        .slice(0, 8),
    [state.inventory],
  );

  return (
    <div>
      <h1 className="page-title font-serif">Executive overview</h1>
      <p className="page-sub">
        Branch-level revenue, clinical throughput, receivables, supply chain, and patient experience — synthesized for ownership.
        Dokki and Zayed operate as one ledger: unified patient IDs, appointments, invoices, and inventory visibility.
      </p>

      <div className="grid grid-4 mb-md">
        <StatCard label="Total revenue (EGP)" value={formatMoney(totalPayments)} hint="Sum of completed patient payments (cash in)" />
        <StatCard label="Total outstanding (EGP)" value={formatMoney(arOpen)} hint="Balances still owed on patient invoices" />
        <StatCard
          label="Payments this month (EGP)"
          value={formatMoney(paymentsThisMonth)}
          hint={`Payment dates in ${monthPrefix}`}
        />
        <div className="card card-hover owner-fin-card owner-fin-card--ratio">
          <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Paid vs outstanding (invoice value)
          </div>
          {invoiceCollectionPulse.pctCollected != null ? (
            <>
              <div className="owner-ratio-bar" aria-hidden>
                <div className="owner-ratio-bar__paid" style={{ width: `${invoiceCollectionPulse.pctCollected}%` }} />
                <div
                  className="owner-ratio-bar__open"
                  style={{ width: `${Math.max(0, 100 - invoiceCollectionPulse.pctCollected)}%` }}
                />
              </div>
              <div className="owner-ratio-legend">
                <span className="owner-ratio-legend__paid">{invoiceCollectionPulse.pctCollected}% paid</span>
                <span className="owner-ratio-legend__open">
                  {Math.round((100 - invoiceCollectionPulse.pctCollected) * 10) / 10}% outstanding
                </span>
              </div>
              <div className="muted mt-sm" style={{ fontSize: '0.8rem' }}>
                Of {formatMoney(invoiceCollectionPulse.billed)} billed · {formatMoney(invoiceCollectionPulse.collected)}{' '}
                collected
              </div>
            </>
          ) : (
            <div className="font-serif" style={{ fontSize: '1.35rem', marginTop: '0.35rem' }}>
              —
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-4 mb-md">
        <StatCard
          label="Active appointments"
          value={activeAppointmentCount}
          hint="Not completed or cancelled (scheduled, confirmed, chair time, rescheduled-as-active)"
        />
        <StatCard label="Treatment records" value={treatmentVolume} hint="Completed / documented procedures" />
        <StatCard label="Low / critical SKUs (all sites)" value={lowStock.length} hint="Across both branches" />
        <StatCard label="POs awaiting approval" value={pendingPo} hint="Owner action queue" />
      </div>

      <div className="grid grid-2 mb-md">
        <StatCard label="Billed services (invoices)" value={formatMoney(invoiceTotals)} hint="Invoice face value before write-offs" />
        <StatCard label="Patient feedback submissions" value={submittedRatings.length} hint="Completed rating forms — see satisfaction card below" />
      </div>

      <div className="grid grid-2 mb-md">
        <div className="card">
          <h2 className="card-title">Revenue by branch (Dokki vs Zayed)</h2>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>
            Allocated from payment records by receiving branch (EGP collected).
          </p>
          <div className="chart-bar-wrap" style={{ minHeight: 140, marginTop: '1rem' }}>
            {state.branches.map((b) => (
              <div
                key={b.id}
                className="chart-bar"
                style={{ height: `${(revenueByBranch[b.id] / maxBranchRev) * 100}%`, flex: 1 }}
                title={branchNameFromState(state, b.id)}
              >
                <span>{b.shortName}</span>
              </div>
            ))}
          </div>
          <div className="mt-md" style={{ fontSize: '0.9rem' }}>
            {state.branches.map((b) => (
              <div key={b.id} className="flex-between mb-sm">
                <span>{b.name}</span>
                <strong>{formatMoney(revenueByBranch[b.id] || 0)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Branch comparison</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Appointments</th>
                  <th>AR open</th>
                  <th>Low stock</th>
                  <th>Pending POs</th>
                </tr>
              </thead>
              <tbody>
                {state.branches.map((b) => (
                  <tr key={b.id}>
                    <td>{b.shortName}</td>
                    <td>{apptsByBranch[b.id] || 0}</td>
                    <td>{formatMoney(arByBranch[b.id] || 0)}</td>
                    <td>{lowByBranch[b.id] || 0}</td>
                    <td>{pendingPoByBranch[b.id] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-md">
        <div className="card">
          <h2 className="card-title">Appointments by dentist</h2>
          <div className="chart-bar-wrap" style={{ minHeight: 120 }}>
            {apptsByDentist.slice(0, 6).map((d) => (
              <div key={d.dentistId} className="chart-bar" style={{ height: `${(d.count / maxDentistAppt) * 100}%`, flex: 1 }}>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: 1.1 }}>{d.name.split(' ').slice(-1)[0]}</span>
              </div>
            ))}
          </div>
          <div className="table-wrap mt-md">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dentist</th>
                  <th>Specialty</th>
                  <th>Appointments</th>
                </tr>
              </thead>
              <tbody>
                {apptsByDentist.map((d) => (
                  <tr key={d.dentistId}>
                    <td>{d.name}</td>
                    <td>{state.dentists.find((x) => x.id === d.dentistId)?.specialty || '—'}</td>
                    <td>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Supply & payables snapshot</h2>
          <p>
            Supplier invoices unpaid: <strong>{state.supplierInvoices.filter((i) => i.status === 'Unpaid').length}</strong>
          </p>
          <p>
            Refill tickets open: <strong>{state.refillRequests.filter((r) => r.status !== 'Fulfilled').length}</strong>
          </p>
          <p>
            Deliveries logged: <strong>{state.deliveryRecords?.length ?? 0}</strong>
          </p>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
            Low-stock lines are prioritized in the assistant portal; PO approvals route here for capital discipline.
          </p>
        </div>
      </div>

      <div className="grid grid-2 mb-md">
        <div className="card">
          <h2 className="card-title">Most frequent procedures</h2>
          <p className="muted" style={{ fontSize: '0.82rem', marginTop: 0 }}>
            Procedure counts from treatment records — use with supply usage to forecast durable dental materials (composites,
            anesthetics, disposables).
          </p>
          <div className="table-wrap mt-md">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Procedure</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {frequentProcedures.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="muted">
                      No procedures logged yet.
                    </td>
                  </tr>
                ) : (
                  frequentProcedures.map(([name, count]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Supply usage forecast & stockout risk</h2>
          <p className="muted" style={{ fontSize: '0.82rem', marginTop: 0 }}>
            Non-expiring and long-shelf-life materials (gloves, resin, burs, sterilization consumables) tied to procedure mix.
            Prototype projection — not live forecasting.
          </p>
          <p style={{ fontSize: '0.88rem', marginTop: '0.75rem' }}>
            <strong>Recommended reorder based on procedure trends:</strong> When restorative/endodontic volume rises week-over-week,
            raise reorder targets for composite carts, bonding agents, and rubber-dam consumables before chair-side stockouts delay
            treatment.
          </p>
          <h3 className="font-serif" style={{ fontSize: '1rem', marginTop: '1rem' }}>
            Low-stock dental materials (below reorder level)
          </h3>
          <div className="table-wrap mt-sm">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Branch</th>
                  <th>Qty</th>
                  <th>Reorder</th>
                </tr>
              </thead>
              <tbody>
                {lowStockDentalRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      No below-threshold SKUs right now.
                    </td>
                  </tr>
                ) : (
                  lowStockDentalRows.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>{branchNameFromState(state, i.branchId)}</td>
                      <td>{i.quantity}</td>
                      <td>{i.reorderLevel}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-md">
        <h2 className="card-title">Customer satisfaction insights</h2>
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>
          Service quality feedback from submitted patient ratings — tracks doctor experience, wait perception, and overall visit
          scores.
        </p>
        <div className="flex-between gap-md mt-md" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              Patient rating (submitted)
            </span>
            <div className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 600 }}>
              {avgRating ? avgRating.toFixed(1) : '—'} <span className="muted" style={{ fontSize: '1rem' }}>/ 5</span>
            </div>
            <span className="muted" style={{ fontSize: '0.82rem' }}>
              {submittedRatings.length} responses
            </span>
          </div>
          <Link className="btn btn-secondary btn-sm" to="/owner/ratings">
            View patient feedback &amp; ratings
          </Link>
        </div>
      </div>

      <div className="flex gap-sm mt-md" style={{ flexWrap: 'wrap' }}>
        <Link className="btn btn-primary btn-sm" to="/owner/reports">
          Analytical reports
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/owner/po-approvals">
          Approve POs
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/owner/payment-monitoring">
          Payment monitoring
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/owner/accounts-receivable">
          Accounts receivable
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/owner/ratings">
          Ratings
        </Link>
      </div>
    </div>
  );
}
