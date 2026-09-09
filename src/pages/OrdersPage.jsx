import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Container from '../components/Container.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrders } from '../services/api.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { readStorage } from '../utils/storage.js';

export default function OrdersPage() {
  const { token } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ['orders', token],
    queryFn: async () => {
      try {
        return await getOrders(token);
      } catch {
        return readStorage('orders', []);
      }
    },
  });

  return (
    <>
      <PageMeta title="Orders" />
      <Breadcrumb items={[{ label: 'Account', href: '/account' }, { label: 'Orders' }]} />
      <section className="bg-brand-mist py-12">
        <Container>
          <h1 className="text-4xl font-semibold text-brand-ink">My orders</h1>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading orders...</p>
          ) : data.length ? (
            <div className="space-y-4">
              {data.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}/confirmation`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-soft"
                >
                  <div>
                    <p className="font-semibold text-brand-ink">Order {order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-gray-500">{order.status}</p>
                  </div>
                  <p className="font-bold text-brand-purple">
                    {formatCurrency(order.total || order.totals?.grandTotal || 0)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders yet." text="When you checkout, they will land here." />
          )}
        </Container>
      </section>
    </>
  );
}
