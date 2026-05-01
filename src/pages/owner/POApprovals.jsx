import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatMoney } from '../../utils/format';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';

export function POApprovals() {
  const { state, approvePurchaseOrder, rejectPurchaseOrder } = useAppData();
  const list = state.purchaseOrders.filter((p) => p.status === 'Pending Approval');
  const [sel, setSel] = useState(null);

  return (
    <div>
      <h1 className="page-title font-serif">Purchase order approvals</h1>
      <p className="page-sub">Owner-level control over clinic procurement.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO</th>
              <th>Supplier</th>
              <th>Est.</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{state.suppliers.find((s) => s.id === po.supplierId)?.name}</td>
                <td>{formatMoney(po.estTotal)}</td>
                <td>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSel(po)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? <div className="empty-state">No purchase orders pending approval.</div> : null}
      </div>
      <Modal
        title={sel ? `PO ${sel.id}` : ''}
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        footer={
          sel ? (
            <>
              <button type="button" className="btn btn-danger" onClick={() => { rejectPurchaseOrder(sel.id); setSel(null); }}>
                Reject
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { approvePurchaseOrder(sel.id); setSel(null); }}>
                Approve
              </button>
            </>
          ) : null
        }
      >
        {sel ? (
          <div>
            <p>
              <Badge status="Pending">{sel.status}</Badge>
            </p>
            <ul>
              {sel.items.map((it, idx) => (
                <li key={idx}>
                  {it.name} — qty {it.qty} @ {formatMoney(it.estUnitPrice)}
                </li>
              ))}
            </ul>
            <p>
              <strong>Notes:</strong> {sel.notes || '—'}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
