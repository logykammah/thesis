import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { branchNameFromState } from '../../utils/branch';

export function RefillRequests() {
  const { user } = useAuth();
  const { state, createRefillRequest } = useAppData();
  const invScope = useMemo(
    () => state.inventory.filter((i) => !user.branchId || i.branchId === user.branchId),
    [state.inventory, user.branchId],
  );
  const low = useMemo(() => invScope.filter((i) => i.status !== 'OK'), [invScope]);
  const [itemId, setItemId] = useState(low[0]?.id || invScope[0]?.id);
  const [qty, setQty] = useState(10);

  return (
    <div>
      <h1 className="page-title font-serif">Refill requests</h1>
      <p className="page-sub">Highlight low stock and raise internal refill tickets.</p>
      <div className="card mb-md">
        <h2 className="card-title">Low stock spotlight</h2>
        {low.map((i) => (
          <div key={i.id} className="flex-between mb-sm">
            <span>
              {branchNameFromState(state, i.branchId)} — {i.name}
            </span>
            <span className="muted">
              {i.quantity} / reorder {i.reorderLevel}
            </span>
          </div>
        ))}
        {low.length === 0 ? <div className="muted">All items above reorder levels.</div> : null}
      </div>
      <form
        className="card"
        style={{ maxWidth: 480 }}
        onSubmit={(e) => {
          e.preventDefault();
          createRefillRequest({
            inventoryItemId: itemId,
            requestedQty: qty,
            branchId: state.inventory.find((x) => x.id === itemId)?.branchId,
            requestedBy: user.id,
          });
        }}
      >
        <div className="form-row">
          <label>Item</label>
          <select className="select" value={itemId} onChange={(e) => setItemId(e.target.value)}>
            {invScope.map((i) => (
              <option key={i.id} value={i.id}>
                {branchNameFromState(state, i.branchId)} — {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Requested quantity</label>
          <input className="input" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit refill request
        </button>
      </form>
      <h2 className="card-title mt-md">Recent requests</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Branch</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.refillRequests
              .filter((r) => !user.branchId || r.branchId === user.branchId)
              .map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{branchNameFromState(state, r.branchId)}</td>
                  <td>{state.inventory.find((i) => i.id === r.inventoryItemId)?.name}</td>
                  <td>{r.requestedQty}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
