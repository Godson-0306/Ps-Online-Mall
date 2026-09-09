import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Input from '../components/Input.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createOrder } from '../services/api.js';
import { readStorage, writeStorage } from '../utils/storage.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { activeItems, totalsFor, clearCart } = useCart();
  const { token, user } = useAuth();
  const { pushToast } = useToast();
  const [coupon, setCoupon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const totals = totalsFor(coupon);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: 'Lagos',
      state: 'Lagos',
    },
  });

  const onSubmit = async (values) => {
    if (!activeItems.length) {
      return;
    }

    setSubmitting(true);
    const payload = {
      ...values,
      coupon,
      items: activeItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        image: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
        color: item.color,
        size: item.size,
      })),
      totals,
    };

    try {
      const order = await createOrder(payload, token);
      clearCart();
      if (order.authorizationUrl) {
        window.location.assign(order.authorizationUrl);
        return;
      }
      navigate(`/orders/${order.id}/confirmation`);
    } catch {
      const localOrder = {
        id: `local-${Date.now()}`,
        status: 'paid',
        ...payload,
        createdAt: new Date().toISOString(),
      };
      const existing = readStorage('orders', []);
      writeStorage('orders', [localOrder, ...existing]);
      clearCart();
      pushToast('Order placed in demo mode.');
      navigate(`/orders/${localOrder.id}/confirmation`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Checkout" />
      <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <section className="bg-brand-mist py-12">
        <Container>
          <h1 className="text-4xl font-semibold text-brand-ink">Checkout</h1>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          {activeItems.length ? (
            <form className="grid gap-8 lg:grid-cols-[1fr_380px]" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 rounded-[1.75rem] bg-white p-6 shadow-soft">
                <h2 className="text-xl font-semibold">Delivery details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold" htmlFor="name">
                      Full name
                    </label>
                    <Input id="name" required {...register('name')} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" htmlFor="email">
                      Email
                    </label>
                    <Input id="email" type="email" required {...register('email')} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" htmlFor="phone">
                      Phone
                    </label>
                    <Input id="phone" required {...register('phone')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold" htmlFor="address">
                      Address
                    </label>
                    <Input id="address" required {...register('address')} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" htmlFor="city">
                      City
                    </label>
                    <Input id="city" required {...register('city')} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" htmlFor="state">
                      State
                    </label>
                    <Input id="state" required {...register('state')} />
                  </div>
                </div>
              </div>
              <div>
                <OrderSummary
                  totals={totals}
                  coupon={coupon}
                  onCouponChange={setCoupon}
                  onCheckout={handleSubmit(onSubmit)}
                  buttonLabel={submitting ? 'Placing order...' : 'Pay with Paystack'}
                />
                <p className="mt-3 text-center text-xs text-gray-500">
                  By paying you agree to our{' '}
                  <Link to="/terms" className="font-semibold text-brand-purple">
                    terms
                  </Link>
                  .
                </p>
              </div>
            </form>
          ) : (
            <EmptyState title="Your bag is empty." text="Add an item before checking out.">
              <Button as={Link} to="/shop">
                Continue shopping
              </Button>
            </EmptyState>
          )}
        </Container>
      </section>
    </>
  );
}
