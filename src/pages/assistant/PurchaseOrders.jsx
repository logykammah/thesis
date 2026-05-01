import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';

export function PurchaseOrders() {
  const { user } = useAuth();
  const { state, createPurchaseOrder } = useAppData();
  const [poBranchId, setPoBranchId] = useState(user.branchId || state.branches[0]?.id);
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([
    { inventoryItemId: state.inventory[0]?.id, name: state.inventory[0]?.name, qty: 10, estUnitPrice: 50 },
  ]);

  const addLine = () => {
    const i = state.inventory.filter((x) => x.branchId === poBranchId)[0] || state.inventory[0];
    setLines((ls) => [...ls, { inventoryItemId: i.id, name: i.name, qty: 1, estUnitPrice: 10 }]);
  };

  const submit = (e) => {
    e.preventDefault();
    createPurchaseOrder({ supplierId, items: lines, notes, branchId: poBranchId });
  };

  return (
    <div>
      <h1 className="page-title font-serif">Purchase orders</h1>
      <p className="page-sub">Build a PO — status defaults to pending owner approval.</p>
      <form className="card" onSubmit={submit}>
        <div className="form-row">
          <label>Branch (receiving site)</label>
          <select className="select" value={poBranchId} onChange={(e) => setPoBranchId(e.target.value)}>
            {state.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Supplier</label>
          <select className="select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {state.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        {lines.map((ln, idx) => (
          <div key={idx} className="grid grid-3" style={{ marginBottom: '0.5rem' }}>
            <select
              className="select"
              value={ln.inventoryItemId}
              onChange={(e) => {
                const it = state.inventory.find((i) => i.id === e.target.value);
                const next = [...lines];
                next[idx] = { ...next[idx], inventoryItemId: it.id, name: it.name };
                setLines(next);
              }}
            >
              {state.inventory
                .filter((i) => i.branchId === poBranchId)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
            </select>
            <input
              className="input"
              type="number"
              min={1}
              value={ln.qty}
              onChange={(e) => {
                const next = [...lines];
                next[idx].qty = Number(e.target.value);
                setLines(next);
              }}
            />
            <input
              className="input"
              type="number"
              min={1}
              value={ln.estUnitPrice}
              onChange={(e) => {
                const next = [...lines];
                next[idx].estUnitPrice = Number(e.target.value);
                setLines(next);
              }}
            />
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm mb-md" onClick={addLine}>
          Add line
        </button>
        <div className="form-row">
          <label>Notes</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">
          Create PO
        </button>
      </form>
      <h2 className="card-title mt-md">Existing POs</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO</th>
              <th>Branch</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Est. total</th>
            </tr>
          </thead>
          <tbody>
            {state.purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{branchNameFromState(state, po.branchId)}</td>
                <td>{state.suppliers.find((s) => s.id === po.supplierId)?.name}</td>
                <td>{po.status}</td>
                <td>{formatMoney(po.estTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
