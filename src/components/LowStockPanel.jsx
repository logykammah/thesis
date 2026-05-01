import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { deriveStockStatus, suggestedReorderQty } from '../utils/inventoryLevels';

/**
 * Compact operational panel — only Low Stock / Critical items for a branch (or all).
 */
export function LowStockPanel({ items, branchLabel, onRequestRefill }) {
  const alerts = items.filter((i) => {
    const st = deriveStockStatus(i.quantity, i.reorderLevel);
    return st === 'Low Stock' || st === 'Critical';
  });

  return (
    <div className="low-stock-panel card">
      <div className="low-stock-panel__head">
        <h2 className="card-title" style={{ margin: 0 }}>
          Low stock alerts
        </h2>
        {branchLabel ? (
          <span className="muted" style={{ fontSize: '0.8rem' }}>
            {branchLabel}
          </span>
        ) : null}
      </div>
      <p className="muted" style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
        Items needing replenishment soon. Normal stock is hidden here on purpose.
      </p>
      {alerts.length === 0 ? (
        <div className="empty-state" style={{ padding: '1rem', fontSize: '0.9rem' }}>
          No low or critical items at this branch.
        </div>
      ) : (
        <ul className="low-stock-panel__list">
          {alerts.map((item) => {
            const st = deriveStockStatus(item.quantity, item.reorderLevel);
            const label = st === 'Critical' ? 'Critical' : 'Low';
            return (
              <li key={item.id} className={`low-stock-panel__item low-stock-panel__item--${st === 'Critical' ? 'critical' : 'low'}`}>
                <div className="low-stock-panel__title-row">
                  <strong className="low-stock-panel__name">{item.name}</strong>
                  <Badge status={st === 'Critical' ? 'Critical' : 'Low Stock'}>{label}</Badge>
                </div>
                <div className="muted low-stock-panel__qty" style={{ fontSize: '0.82rem' }}>
                  Stock: <strong>{item.quantity}</strong> {item.unit} · Reorder: <strong>{item.reorderLevel}</strong>
                </div>
                <div className="low-stock-panel__actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      onRequestRefill?.({
                        inventoryItemId: item.id,
                        requestedQty: suggestedReorderQty(item),
                        branchId: item.branchId,
                      })
                    }
                  >
                    Request refill
                  </button>
                  <Link className="btn btn-primary btn-sm" to="/assistant/purchase-orders">
                    Create PO
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
