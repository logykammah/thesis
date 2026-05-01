import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { branchNameFromState } from '../../utils/branch';

export function SupplyUsage() {
  const { user } = useAuth();
  const { state, recordSupplyUsage } = useAppData();
  const [inventoryItemId, setInventoryItemId] = useState(state.inventory[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [visitId, setVisitId] = useState(state.visits[0]?.id || '');
  const [treatmentRecordId, setTreatmentRecordId] = useState(state.treatmentRecords[0]?.id || '');

  const submit = (e) => {
    e.preventDefault();
    recordSupplyUsage({
      inventoryItemId,
      quantity: Number(quantity),
      visitId: visitId || null,
      treatmentRecordId: treatmentRecordId || null,
      recordedBy: user.id,
    });
  };

  return (
    <div>
      <h1 className="page-title font-serif">Supply usage</h1>
      <p className="page-sub">Usage cannot exceed on-hand quantity (overbooking prevention for stock).</p>
      <form className="card" style={{ maxWidth: 520 }} onSubmit={submit}>
        <div className="form-row">
          <label>Item</label>
          <select className="select" value={inventoryItemId} onChange={(e) => setInventoryItemId(e.target.value)}>
            {state.inventory
              .filter((i) => !user.branchId || i.branchId === user.branchId)
              .map((i) => (
                <option key={i.id} value={i.id}>
                  {branchNameFromState(state, i.branchId)} — {i.name} — on hand {i.quantity}
                </option>
              ))}
          </select>
        </div>
        <div className="form-row">
          <label>Quantity used</label>
          <input className="input" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Visit (optional)</label>
          <select className="select" value={visitId} onChange={(e) => setVisitId(e.target.value)}>
            <option value="">—</option>
            {state.visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Treatment (optional)</label>
          <select className="select" value={treatmentRecordId} onChange={(e) => setTreatmentRecordId(e.target.value)}>
            <option value="">—</option>
            {state.treatmentRecords.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Record usage
        </button>
      </form>
    </div>
  );
}
