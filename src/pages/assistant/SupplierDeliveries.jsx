import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/Badge';
import { branchNameFromState } from '../../utils/branch';

export function SupplierDeliveries() {
  const { user } = useAuth();
  const { state, receiveSupplierDelivery } = useAppData();
  const branchId = user.branchId;

  const receivable = useMemo(
    () =>
      state.purchaseOrders.filter(
        (p) => (p.status === 'Approved' || p.status === 'Pending Approval') && (!branchId || p.branchId === branchId),
      ),
    [state.purchaseOrders, branchId],
  );

  const [poId, setPoId] = useState(receivable[0]?.id || '');
  const po = state.purchaseOrders.find((p) => p.id === poId);
  const [mismatch, setMismatch] = useState('');
  const [qtys, setQtys] = useState(() => {
    const p = receivable[0];
    const o = {};
    p?.items.forEach((it) => {
      o[it.inventoryItemId] = it.qty;
    });
    return o;
  });

  const syncQtys = (id) => {
    const p = state.purchaseOrders.find((x) => x.id === id);
    const o = {};
    p?.items.forEach((it) => {
      o[it.inventoryItemId] = it.qty;
    });
    setQtys(o);
  };

  const deliveries = useMemo(() => {
    return [...state.deliveryRecords]
      .filter((d) => !branchId || d.branchId === branchId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.deliveryRecords, branchId]);

  return (
    <div>
      <h1 className="page-title font-serif">Supplier deliveries</h1>
      <p className="page-sub">
        Receipt history with ordered vs received quantities — mismatches stay visible for AP and inventory control.
      </p>

      <div className="card mb-md">
        <h2 className="card-title">Delivery history</h2>
        {deliveries.length === 0 ? (
          <p className="muted">No deliveries recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Branch</th>
                  <th>Purchase order</th>
                  <th>Status</th>
                  <th>Lines</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => {
                  const poRow = state.purchaseOrders.find((p) => p.id === d.purchaseOrderId);
                  const supplier = state.suppliers.find((s) => s.id === (d.supplierId || poRow?.supplierId));
                  return (
                    <tr key={d.id}>
                      <td>{d.date}</td>
                      <td>{supplier?.name || '—'}</td>
                      <td>{branchNameFromState(state, d.branchId)}</td>
                      <td>
                        <strong>{d.purchaseOrderId || '—'}</strong>
                      </td>
                      <td>
                        <Badge status={d.receiptStatus === 'Mismatch' ? 'Critical' : 'OK'}>
                          {d.receiptStatus === 'Mismatch' ? 'Mismatch' : 'Complete'}
                        </Badge>
                      </td>
                      <td style={{ maxWidth: 420 }}>
                        {(d.lines || []).map((ln) => {
                          const ordered =
                            ln.orderedQty ?? poRow?.items?.find((it) => it.inventoryItemId === ln.inventoryItemId)?.qty ?? '—';
                          const recv = ln.deliveredQty;
                          const diff = ln.variance ?? (typeof ordered === 'number' ? recv - ordered : null);
                          const name =
                            state.inventory.find((i) => i.id === ln.inventoryItemId)?.name ||
                            poRow?.items?.find((it) => it.inventoryItemId === ln.inventoryItemId)?.name ||
                            ln.inventoryItemId;
                          return (
                            <div key={`${d.id}-${ln.inventoryItemId}`} style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <strong>{name}</strong>
                              <div className="muted">
                                Ordered: {ordered} · Received: {recv}
                                {diff != null && diff !== 0 ? (
                                  <span style={{ color: '#b45309', marginLeft: '0.35rem' }}>
                                    · Difference: {diff > 0 ? '+' : ''}
                                    {diff}
                                  </span>
                                ) : (
                                  <span className="muted" style={{ marginLeft: '0.35rem' }}>
                                    · Match
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {d.notes ? (
                          <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                            Notes: {d.notes}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h2 className="card-title">Record new delivery</h2>
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>
          Enter received quantities. If they differ from the PO, describe the variance in notes — stock updates from received amounts.
        </p>
        <div className="form-row">
          <label>Purchase order</label>
          <select
            className="select"
            value={poId}
            onChange={(e) => {
              setPoId(e.target.value);
              syncQtys(e.target.value);
            }}
          >
            {receivable.length === 0 ? <option value="">No open POs</option> : null}
            {receivable.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.status} · {branchNameFromState(state, p.branchId)}
              </option>
            ))}
          </select>
        </div>
        {po?.items?.map((it) => (
          <div key={it.inventoryItemId} className="form-row">
            <label>
              {it.name} <span className="muted">(ordered {it.qty})</span>
            </label>
            <input
              className="input"
              type="number"
              min={0}
              value={qtys[it.inventoryItemId] ?? 0}
              onChange={(e) => setQtys({ ...qtys, [it.inventoryItemId]: Number(e.target.value) })}
            />
          </div>
        ))}
        <div className="form-row">
          <label>Variance / delivery notes</label>
          <textarea className="textarea" value={mismatch} onChange={(e) => setMismatch(e.target.value)} placeholder="e.g. 1 carton damaged — supplier credit pending" />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!po}
          onClick={() => {
            if (!po) return;
            const lines = po.items.map((it) => ({
              inventoryItemId: it.inventoryItemId,
              deliveredQty: qtys[it.inventoryItemId] ?? 0,
            }));
            receiveSupplierDelivery({ purchaseOrderId: poId, lines, notes: mismatch });
          }}
        >
          Record delivery &amp; update stock
        </button>
      </div>
    </div>
  );
}
