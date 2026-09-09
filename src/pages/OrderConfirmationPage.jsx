import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrder } from '../services/api.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { readStorage } from '../utils/storage.js';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        return await getOrder(orderId, token);
      } catch {
        return readStorage('orders', []).find((item) => item.id === orderId) || null;
      }
    },
  });

  const total = order?.total || order?.totals?.grandTotal || 0;

  return (
    <>
      <PageMeta title="Order confirmed" />
      <Breadcrumb items={[{ label: 'Orders', href: '/account/orders' }, { label: 'Confirmation' }]} />
      <section className="py-16">
        <Container className="max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Thank you</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand-ink">Order received</h1>
          <p className="mt-4 text-sm leading-7 text-gray-500">
            {order
              ? `Order ${order.id} is ${order.status}. Total ${formatCurrency(total)}.`
              : 'We are confirming your payment. You can keep shopping while we update this page.'}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button as={Link} to="/shop">
              Continue shopping
            </Button>
            <Button as={Link} to="/account/orders" variant="secondary">
              View orders
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
