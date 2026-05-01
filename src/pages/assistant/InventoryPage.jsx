import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/Badge';
import { branchNameFromState } from '../../utils/branch';
import { deriveStockStatus, suggestedReorderQty } from '../../utils/inventoryLevels';

function stockBadgeLabel(status) {
  if (status === 'Low Stock') return 'Low Stock';
  if (status === 'Critical') return 'Critical';
  return 'OK';
}

export function InventoryPage() {
  const { user } = useAuth();
  const { state, createRefillRequest } = useAppData();
  const [branchFilter, setBranchFilter] = useState(user.branchId || 'all');

  const rows = useMemo(() => {
    return state.inventory.filter((i) => branchFilter === 'all' || i.branchId === branchFilter);
  }, [state.inventory, branchFilter]);

  const stats = useMemo(() => {
    let low = 0;
    let critical = 0;
    rows.forEach((i) => {
      const st = deriveStockStatus(i.quantity, i.reorderLevel);
      if (st === 'Low Stock') low += 1;
      if (st === 'Critical') critical += 1;
    });
    return { low, critical };
  }, [rows]);

  return (
    <div>
      <h1 className="page-title font-serif">Inventory</h1>
      <p className="page-sub">
        Branch stock levels — statuses are computed from quantity vs reorder point. Low and critical rows are highlighted; use the
        dashboard <strong>Low stock</strong> panel for faster triage.
      </p>
      <div className="toolbar" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="select" style={{ maxWidth: 220 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All branches</option>
          {state.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.shortName}
            </option>
          ))}
        </select>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {rows.length} SKUs ·{' '}
          <strong style={{ color: '#b45309' }}>{stats.low}</strong> low ·{' '}
          <strong style={{ color: '#b91c1c' }}>{stats.critical}</strong> critical
        </span>
        <Link className="btn btn-secondary btn-sm" to="/assistant/purchase-orders">
          Create PO
        </Link>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Item</th>
              <th>SKU</th>
              <th>Current stock</th>
              <th>Reorder level</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const st = deriveStockStatus(i.quantity, i.reorderLevel);
              const rowClass =
                st === 'Critical' ? 'inventory-row-critical' : st === 'Low Stock' ? 'inventory-row-low' : '';
              const alert =
                st === 'Critical'
                  ? `${i.name.split('(')[0].trim()} is critically low — reorder now.`
                  : st === 'Low Stock'
                    ? `${i.name.split('(')[0].trim()} is approaching reorder — schedule refill.`
                    : null;
              return (
                <tr key={i.id} className={rowClass}>
                  <td>{branchNameFromState(state, i.branchId)}</td>
                  <td>
                    {i.name}
                    {alert ? (
                      <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                        {alert}
                      </div>
                    ) : null}
                  </td>
                  <td>{i.sku}</td>
                  <td>
                    {i.quantity} {i.unit}
                  </td>
                  <td>{i.reorderLevel}</td>
                  <td>
                    <Badge status={st === 'OK' ? 'OK' : st === 'Critical' ? 'Critical' : 'Low Stock'}>{stockBadgeLabel(st)}</Badge>
                  </td>
                  <td>
                    {st !== 'OK' ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          createRefillRequest({
                            inventoryItemId: i.id,
                            requestedQty: suggestedReorderQty(i),
                            branchId: i.branchId,
                            requestedBy: user?.id || 'A-001',
                          })
                        }
                      >
                        Request refill
                      </button>
                    ) : (
                      <span className="muted" style={{ fontSize: '0.8rem' }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
