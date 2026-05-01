import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { LowStockPanel } from '../../components/LowStockPanel';
import { todayISODate, addDaysISODate } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';
import { appointmentStatusLabel, includeInAssistantTodayLane, isActivePipelineStatus } from '../../utils/appointments';
import { deriveStockStatus } from '../../utils/inventoryLevels';

export function AssistantDashboard() {
  const { user } = useAuth();
  const { state, createRefillRequest } = useAppData();
  const today = todayISODate();
  const branchId = user.branchId;

  const scopeAppt = (a) => !branchId || a.branchId === branchId;
  const scopeInv = (i) => !branchId || i.branchId === branchId;

  /** Same shared `state.appointments` as patient/dentist/manager — local calendar day + branch */
  const todayQueue = useMemo(() => {
    return state.appointments
      .filter((a) => scopeAppt(a) && a.date === today && includeInAssistantTodayLane(a.status))
      .sort((a, b) => {
        const aDone = a.status === 'Completed';
        const bDone = b.status === 'Completed';
        if (aDone !== bDone) return aDone ? 1 : -1;
        return a.time.localeCompare(b.time);
      });
  }, [state.appointments, branchId, today]);

  /** Highlight patient-portal bookings on today’s schedule (shared state updates instantly via context) */
  const patientPortalToday = useMemo(
    () => todayQueue.filter((a) => a.createdBy === 'patient'),
    [todayQueue],
  );

  const todayActiveCount = useMemo(() => todayQueue.filter((a) => isActivePipelineStatus(a.status)).length, [todayQueue]);

  const upcomingWeek = useMemo(() => {
    const end = addDaysISODate(today, 7);
    return state.appointments.filter(
      (a) =>
        scopeAppt(a) &&
        isActivePipelineStatus(a.status) &&
        a.date >= today &&
        a.date <= end &&
        a.date !== today,
    ).length;
  }, [state.appointments, branchId, today]);

  const inventoryScoped = useMemo(() => state.inventory.filter(scopeInv), [state.inventory, branchId]);

  const lowStockCount = useMemo(
    () => inventoryScoped.filter((i) => deriveStockStatus(i.quantity, i.reorderLevel) === 'Low Stock').length,
    [inventoryScoped],
  );

  const criticalCount = useMemo(
    () => inventoryScoped.filter((i) => deriveStockStatus(i.quantity, i.reorderLevel) === 'Critical').length,
    [inventoryScoped],
  );

  const newRegsWindow = useMemo(() => {
    const since = addDaysISODate(today, -7);
    return state.patients.filter((p) => (p.registeredAt || '') >= since).length;
  }, [state.patients, today]);

  const pendingRefills = state.refillRequests.filter(
    (r) => r.status === 'Pending' && (!branchId || r.branchId === branchId),
  ).length;

  const pendingPo = state.purchaseOrders.filter(
    (p) => p.status === 'Pending Approval' && (!branchId || p.branchId === branchId),
  ).length;

  const recentDeliveries = useMemo(
    () =>
      [...state.deliveryRecords]
        .filter((d) => !branchId || d.branchId === branchId)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [state.deliveryRecords, branchId],
  );

  const onRefill = (payload) => {
    createRefillRequest({ ...payload, requestedBy: user?.id || 'A-001' });
  };

  return (
    <div className="assistant-dashboard">
      <h1 className="page-title font-serif">Assistant operations</h1>
      <p className="page-sub">
        Live data from the shared clinic ledger — same appointments as patient and dentist portals.
        {branchId ? (
          <>
            {' '}
            Branch: <strong>{branchNameFromState(state, branchId)}</strong>.
          </>
        ) : (
          ' All branches.'
        )}
      </p>

      <div className="grid grid-4 mb-md">
        <StatCard label="Today’s appointments" value={todayQueue.length} hint={`${todayActiveCount} active · same ledger as patient & dentist`} />
        <StatCard label="Low stock SKUs" value={lowStockCount} hint="Near reorder level" />
        <StatCard label="Critical SKUs" value={criticalCount} hint="At or below reorder" />
        <StatCard label="New registrations (7d)" value={newRegsWindow} hint="Patients added this week" />
      </div>
      <div className="grid grid-4 mb-md">
        <StatCard label="Upcoming (7 days)" value={upcomingWeek} hint="Excluding today · active pipeline" />
        <StatCard label="Pending refills" value={pendingRefills} hint="Awaiting procurement" />
        <StatCard label="POs pending owner" value={pendingPo} />
        <StatCard label="Patients on file" value={state.patients.length} />
      </div>

      <div className="assistant-dashboard__main">
        <div className="assistant-dashboard__left">
          <div className="card mb-md">
            <div className="flex-between mb-md" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                Today’s appointments
              </h2>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                <Link className="btn btn-secondary btn-sm" to="/assistant/appointments">
                  Full schedule &amp; filters
                </Link>
                <Link className="btn btn-primary btn-sm" to="/assistant/register">
                  Register patient
                </Link>
              </div>
            </div>
            <p className="muted" style={{ fontSize: '0.82rem', marginTop: 0 }}>
              Live from shared state — includes patient portal and desk bookings for this branch.
            </p>
            {patientPortalToday.length > 0 ? (
              <div
                className="assistant-dash-notice"
                style={{
                  marginBottom: '0.85rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--color-primary)',
                  background: 'linear-gradient(90deg, rgba(74, 98, 122, 0.08), transparent)',
                  fontSize: '0.88rem',
                }}
              >
                <strong>Patient portal:</strong> {patientPortalToday.length === 1 ? '1 booking' : `${patientPortalToday.length} bookings`}{' '}
                on today’s schedule
                {patientPortalToday.length <= 3
                  ? ` (${patientPortalToday.map((x) => state.patients.find((p) => p.id === x.patientId)?.fullName || x.time).join(', ')})`
                  : ''}
                .
              </div>
            ) : null}
            {todayQueue.map((a) => (
              <div
                key={a.id}
                className={`flex-between mb-sm assistant-today-row${a.createdBy === 'patient' ? ' assistant-today-row--portal' : ''}`}
                style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}
              >
                <div>
                  <strong>{a.time}</strong> · {state.patients.find((p) => p.id === a.patientId)?.fullName || '—'}
                  {a.createdBy === 'patient' ? (
                    <span className="badge badge-confirmed" style={{ marginLeft: '0.35rem', fontSize: '0.65rem', verticalAlign: 'middle' }}>
                      Portal
                    </span>
                  ) : null}
                  <div className="muted" style={{ fontSize: '0.82rem' }}>
                    {state.dentists.find((d) => d.id === a.dentistId)?.fullName || '—'} · {branchNameFromState(state, a.branchId)}
                    {' · '}
                    {a.requestedServiceLabel || a.specialty}
                  </div>
                </div>
                <Badge status={a.status}>{appointmentStatusLabel(a.status)}</Badge>
              </div>
            ))}
            {todayQueue.length === 0 ? (
              <div className="empty-state" style={{ padding: '1rem' }}>
                No active appointments on the calendar for today at this branch. Upcoming bookings still appear under Manage appointments.
              </div>
            ) : null}
          </div>

          <div className="grid grid-2" style={{ gap: '0.75rem' }}>
            <div className="card">
              <h2 className="card-title">Pending purchase orders</h2>
              {state.purchaseOrders.filter((p) => p.status === 'Pending Approval' && (!branchId || p.branchId === branchId)).length === 0 ? (
                <p className="muted" style={{ fontSize: '0.88rem' }}>
                  None awaiting approval.
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.88rem' }}>
                  {state.purchaseOrders
                    .filter((p) => p.status === 'Pending Approval' && (!branchId || p.branchId === branchId))
                    .slice(0, 5)
                    .map((p) => (
                      <li key={p.id}>
                        <strong>{p.id}</strong> · {state.suppliers.find((s) => s.id === p.supplierId)?.name || p.supplierId}
                      </li>
                    ))}
                </ul>
              )}
              <Link className="btn btn-secondary btn-sm mt-md" to="/assistant/purchase-orders">
                Purchase orders
              </Link>
            </div>
            <div className="card">
              <h2 className="card-title">Recent supplier deliveries</h2>
              {recentDeliveries.length === 0 ? (
                <p className="muted" style={{ fontSize: '0.88rem' }}>
                  No deliveries logged yet.
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem' }}>
                  {recentDeliveries.map((d) => (
                    <li key={d.id}>
                      <strong>{d.date}</strong> · PO {d.purchaseOrderId || '—'} ·{' '}
                      {d.receiptStatus === 'Mismatch' ? (
                        <span style={{ color: '#b45309' }}>Mismatch</span>
                      ) : (
                        <span className="muted">Complete</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link className="btn btn-secondary btn-sm mt-md" to="/assistant/deliveries">
                Deliveries
              </Link>
            </div>
          </div>

          <div className="card mt-md">
            <h2 className="card-title">Shortcuts</h2>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              <Link className="btn btn-secondary btn-sm" to="/assistant/payments">
                Record payment
              </Link>
              <Link className="btn btn-secondary btn-sm" to="/assistant/invoices/new">
                Generate invoice
              </Link>
              <Link className="btn btn-secondary btn-sm" to="/assistant/refills">
                Refill requests
              </Link>
              <Link className="btn btn-secondary btn-sm" to="/assistant/inventory">
                Full inventory
              </Link>
              <Link className="btn btn-secondary btn-sm" to="/assistant/update-patient">
                Edit patient details
              </Link>
            </div>
          </div>
        </div>

        <aside className="assistant-dashboard__aside">
          <p className="muted" style={{ fontSize: '0.78rem', marginBottom: '0.5rem', lineHeight: 1.45 }}>
            Inventory covers durable dental supplies and non-expiring materials (nitrile gloves, composites, anesthetics, sterilization
            pouches). Low-stock alerts help avoid chair-side stockouts on reusable or long-shelf-life items.
          </p>
          <LowStockPanel
            items={inventoryScoped}
            branchLabel={branchId ? branchNameFromState(state, branchId) : 'All branches'}
            onRequestRefill={onRefill}
          />
          <div className="card mt-md">
            <h2 className="card-title">Pending refill tickets</h2>
            <p style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.25rem 0' }}>{pendingRefills}</p>
            <Link className="btn btn-secondary btn-sm" to="/assistant/refills">
              Open queue
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
