import { Heart, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import EmptyState from '../components/EmptyState.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import PageMeta from '../components/PageMeta.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getProducts } from '../services/api.js';
import { enrichProducts } from '../utils/enrichProducts.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function CartPage() {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const { items, updateQuantity, removeItem, saveForLater, totalsFor } = useCart();
  const { data = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const products = useMemo(() => enrichProducts(data), [data]);
  const totals = totalsFor(coupon);
  const recommended = products.slice(3, 7);

  return (
    <>
      <PageMeta title="Cart" />
      <Breadcrumb items={[{ label: 'Cart' }]} />
      <section className="bg-brand-mist py-12">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
            Shopping bag
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-brand-ink">Your Cart</h1>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          {items.length ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.article
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid gap-4 rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-soft sm:grid-cols-[120px_1fr] sm:p-5"
                    >
                      <Link
                        to={`/products/${item.product.id}`}
                        className="aspect-square overflow-hidden rounded-2xl bg-brand-mist"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div>
                          <Link
                            to={`/products/${item.product.id}`}
                            className="text-lg font-semibold text-brand-ink transition hover:text-brand-purple"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-2 text-sm text-gray-500">
                            {item.color} / {item.size}
                          </p>
                          {item.saved ? (
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                              Saved for later
                            </p>
                          ) : null}
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => saveForLater(item.id)}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-purple"
                            >
                              <Heart size={16} aria-hidden="true" />
                              Save For Later
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 md:items-end">
                          <div className="inline-flex w-max items-center rounded-full border border-gray-200">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-3"
                            >
                              <Minus size={16} aria-hidden="true" />
                            </button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 0.8, opacity: 0.4 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="min-w-10 text-center text-sm font-bold"
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-3"
                            >
                              <Plus size={16} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-sm text-gray-500">
                              Price {formatCurrency(item.product.price)}
                            </p>
                            <p className="mt-1 text-lg font-bold text-brand-purple">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
              <OrderSummary
                totals={totals}
                coupon={coupon}
                onCouponChange={setCoupon}
                onCheckout={() => navigate('/checkout')}
              />
            </div>
          ) : (
            <EmptyState
              title="Your cart is beautifully empty."
              text="Browse the shop and add something worth unboxing."
            >
              <Button as={Link} to="/shop">
                <ShoppingBag className="mr-2" size={17} aria-hidden="true" />
                Start Shopping
              </Button>
            </EmptyState>
          )}
        </Container>
      </section>

      <section className="bg-brand-mist py-16">
        <Container>
          <h2 className="mb-8 text-3xl font-semibold text-brand-ink">Recommended Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
