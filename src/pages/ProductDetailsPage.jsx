import {
  Heart,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import PageMeta from '../components/PageMeta.jsx';
import ProductBadge from '../components/ProductBadge.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { getProducts } from '../services/api.js';
import { enrichProducts } from '../utils/enrichProducts.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getRecentlyViewedIds, recordRecentlyViewed } from '../utils/recentlyViewed.js';
import NotFoundPage from './NotFoundPage.jsx';

const tabs = ['Description', 'Specifications', 'Reviews', 'Shipping Information'];
const reviews = [
  {
    name: 'Amara K.',
    rating: 5,
    text: 'Beautiful finish, fast delivery, and the packaging felt premium.',
  },
  {
    name: 'Tolu A.',
    rating: 5,
    text: 'Exactly as pictured. The quality feels better than most online finds.',
  },
  {
    name: 'Nneka O.',
    rating: 4,
    text: 'Lovely product and smooth checkout. I would order again.',
  },
];

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState('');
  const [activeSize, setActiveSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const products = useMemo(() => enrichProducts(data), [data]);
  const product = products.find((item) => item.id === productId);
  const relatedProducts = products
    .filter((item) => item.id !== product?.id && item.category === product?.category)
    .concat(products.filter((item) => item.id !== product?.id))
    .slice(0, 4);
  const recentlyViewed = getRecentlyViewedIds()
    .map((id) => products.find((item) => item.id === id))
    .filter((item) => item && item.id !== product?.id)
    .slice(0, 4);

  useEffect(() => {
    setActiveImage(0);
    setActiveColor('');
    setActiveSize('');
    setQuantity(1);
    if (productId) {
      recordRecentlyViewed(productId);
    }
  }, [productId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!product) {
    return <NotFoundPage />;
  }

  const selectedColor = activeColor || product.colors[0];
  const selectedSize = activeSize || product.sizes[0];
  const saved = isWishlisted(product.id);

  const addToCart = () => {
    addItem(product, { quantity, color: selectedColor, size: selectedSize });
    pushToast(`${product.name} added to cart`);
  };

  const buyNow = () => {
    addItem(product, { quantity, color: selectedColor, size: selectedSize });
    navigate('/checkout');
  };

  const shareProduct = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      pushToast('Product link copied');
    } catch {
      pushToast('Could not share this product.', 'error');
    }
  };

  return (
    <>
      <PageMeta title={product.name} description={product.description} />
      <Breadcrumb
        items={[
          { label: 'Shop', href: '/shop' },
          { label: product.name },
        ]}
      />
      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 lg:grid-cols-[92px_1fr]"
            >
              <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
                {product.gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-brand-mist transition ${
                      activeImage === index ? 'border-brand-purple' : 'border-gray-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="order-1 relative overflow-hidden rounded-[2rem] bg-brand-mist shadow-soft lg:order-2">
                {product.discount ? <ProductBadge>-{product.discount}%</ProductBadge> : null}
                <img
                  src={product.gallery[activeImage]}
                  alt={product.name}
                  className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="lg:sticky lg:top-32 lg:self-start"
            >
              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
                  {product.brand}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-brand-ink sm:text-4xl">
                  {product.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-ink">
                    <Star size={16} fill="currentColor" className="text-brand-gold" />
                    {product.rating} average rating
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    {product.availability}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                  <p className="text-3xl font-bold text-brand-purple">
                    {formatCurrency(product.price)}
                  </p>
                  {product.originalPrice ? (
                    <p className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </p>
                  ) : null}
                </div>
                <p className="mt-5 text-sm leading-7 text-gray-500">{product.description}</p>

                <div className="mt-7 space-y-6">
                  <div>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-brand-ink">
                      Color: {selectedColor}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setActiveColor(color)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            selectedColor === color
                              ? 'border-brand-purple bg-brand-purple text-white'
                              : 'border-gray-200 text-gray-600 hover:border-brand-purple'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-brand-ink">
                      Size: {selectedSize}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setActiveSize(size)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            selectedSize === size
                              ? 'border-brand-purple bg-brand-purple text-white'
                              : 'border-gray-200 text-gray-600 hover:border-brand-purple'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 text-brand-ink"
                      >
                        <Minus size={17} aria-hidden="true" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-bold">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 text-brand-ink"
                      >
                        <Plus size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <Button type="button" className="flex-1" onClick={addToCart}>
                      <ShoppingBag className="mr-2" size={17} aria-hidden="true" />
                      Add To Cart
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Button type="button" variant="gold" onClick={buyNow}>
                      <Zap className="mr-2" size={17} aria-hidden="true" />
                      Buy Now
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        toggleItem(product);
                        pushToast(saved ? 'Removed from wishlist' : 'Saved to wishlist');
                      }}
                    >
                      <Heart className="mr-2" size={17} aria-hidden="true" />
                      {saved ? 'Saved' : 'Wishlist'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={shareProduct}>
                      <Share2 className="mr-2" size={17} aria-hidden="true" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>

      <section className="bg-brand-mist py-14">
        <Container>
          <div className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
            <div className="flex gap-2 overflow-x-auto border-b border-gray-100 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-600 hover:bg-brand-mist hover:text-brand-purple'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="pt-6 text-sm leading-7 text-gray-600">
              {activeTab === 'Description' ? <p>{product.description}</p> : null}
              {activeTab === 'Specifications' ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.specifications.map((item) => (
                    <li key={item} className="rounded-2xl bg-brand-mist px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {activeTab === 'Reviews' ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {reviews.map((review) => (
                    <article key={review.name} className="rounded-2xl bg-brand-mist p-5">
                      <div className="mb-3 flex text-brand-gold">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <h3 className="font-semibold text-brand-ink">{review.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{review.text}</p>
                    </article>
                  ))}
                </div>
              ) : null}
              {activeTab === 'Shipping Information' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-brand-mist p-5">
                    <Truck className="mb-3 text-brand-purple" size={24} />
                    Fast delivery across major cities with tracking.
                  </div>
                  <div className="rounded-2xl bg-brand-mist p-5">
                    <ShieldCheck className="mb-3 text-brand-purple" size={24} />
                    Secure checkout and easy return support.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
                Recommended
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-brand-ink">Related Products</h2>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-brand-purple">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </Container>
      </section>

      {recentlyViewed.length ? (
        <section className="bg-brand-mist py-16">
          <Container>
            <h2 className="mb-8 text-3xl font-semibold text-brand-ink">Recently Viewed</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {recentlyViewed.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
