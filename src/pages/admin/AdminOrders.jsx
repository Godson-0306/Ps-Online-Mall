import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminListOrders, adminUpdateOrder } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const statuses = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { data = [], refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminListOrders(token),
  });

  const updateStatus = async (id, status) => {
    try {
      await adminUpdateOrder(id, status, token);
      pushToast('Order updated');
      refetch();
    } catch (error) {
      pushToast(error.response?.data?.error || 'Could not update order.', 'error');
    }
  };

  return (
    <div className="overflow-x-auto rounded-[1.5rem] bg-white shadow-soft">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-100 text-gray-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order.id} className="border-b border-gray-50">
              <td className="px-4 py-3 font-semibold">{order.id.slice(0, 8)}</td>
              <td className="px-4 py-3">{order.email}</td>
              <td className="px-4 py-3">{formatCurrency(order.total)}</td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                  className="rounded-full border border-gray-200 px-3 py-2"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
