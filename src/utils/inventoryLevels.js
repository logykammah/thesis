/**
 * Operational stock tiers for clinic inventory UI and state updates.
 * OK: comfortably above reorder
 * Low Stock: near reorder (replenishment soon)
 * Critical: at/below reorder or out of stock
 */
export function deriveStockStatus(qty, reorderLevel) {
  const r = Math.max(0, Number(reorderLevel) || 0);
  const q = Number(qty) || 0;
  if (q <= 0) return 'Critical';
  if (r === 0) return 'OK';
  if (q < r) return 'Critical';
  const nearCeiling = Math.ceil(r * 1.25);
  if (q <= nearCeiling) return 'Low Stock';
  return 'OK';
}

export function syncInventoryItemStatus(item) {
  if (!item) return;
  item.status = deriveStockStatus(item.quantity, item.reorderLevel);
}

export function isStockAlertStatus(status) {
  return status === 'Low Stock' || status === 'Critical';
}

/** Suggested reorder qty when requesting refill from current level */
export function suggestedReorderQty(item) {
  const r = Math.max(1, Number(item.reorderLevel) || 1);
  const q = Number(item.quantity) || 0;
  return Math.max(r * 2 - q, r);
}
