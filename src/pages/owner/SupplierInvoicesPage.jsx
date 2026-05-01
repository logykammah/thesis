import { useAppData } from '../../context/AppDataContext';
import { formatMoney, formatDate } from '../../utils/format';
import { Badge } from '../../components/Badge';

export function SupplierInvoicesPage() {
  const { state } = useAppData();
  return (
    <div>
      <h1 className="page-title font-serif">Supplier invoices</h1>
      <p className="page-sub">Accounts payable visibility linked to suppliers and POs.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.supplierInvoices.map((si) => (
              <tr key={si.id}>
                <td>{si.id}</td>
                <td>{state.suppliers.find((s) => s.id === si.supplierId)?.name}</td>
                <td>{formatMoney(si.amount)}</td>
                <td>{formatDate(si.dueDate)}</td>
                <td>
                  <Badge status={si.status === 'Paid' ? 'Paid' : 'Unpaid'}>{si.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
