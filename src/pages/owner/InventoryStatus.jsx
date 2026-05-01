import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/Badge';

export function InventoryStatus() {
  const { state } = useAppData();
  return (
    <div>
      <h1 className="page-title font-serif">Inventory status</h1>
      <p className="page-sub">Reorder levels and calm traffic-light badges.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Stock</th>
              <th>Reorder</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.inventory.map((i) => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>
                  {i.quantity} {i.unit}
                </td>
                <td>{i.reorderLevel}</td>
                <td>
                  <Badge status={i.status === 'OK' ? 'OK' : i.status === 'Critical' ? 'Critical' : 'Low Stock'}>{i.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
