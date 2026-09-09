import { Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductBadge from './ProductBadge.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function ProductCard({ product, compact = false }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { pushToast } = useToast();
  const saved = isWishlisted(product.id);

  const addToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product, { quantity: 1 });
    pushToast(`${product.name} added to cart`);
  };

  const onWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleItem(product);
    pushToast(saved ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  return (
    <motion.article
      className="group relative overflow-hidden rounded-[1.5rem] bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-mist">
        {product.discount ? <ProductBadge>-{product.discount}%</ProductBadge> : null}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={onWishlist}
          className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft transition ${
            saved ? 'text-brand-purple' : 'text-brand-ink hover:text-brand-purple'
          }`}
        >
          <Heart size={18} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
        </button>
        <Link
          to={`/products/${product.id}`}
          className="absolute inset-x-5 bottom-5 rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-brand-purple shadow-soft transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          Quick View
        </Link>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/products/${product.id}`}
            className="min-h-11 text-sm font-semibold leading-6 text-brand-ink transition hover:text-brand-purple sm:text-base"
          >
            {product.name}
          </Link>
          <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-gold">
            <Star size={15} fill="currentColor" aria-hidden="true" />
            <span className="text-brand-ink">{product.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <p className="font-bold text-brand-purple">{formatCurrency(product.price)}</p>
          {product.originalPrice ? (
            <p className="text-sm text-gray-400 line-through">
              {formatCurrency(product.originalPrice)}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={addToCart}
          className={`inline-flex w-full items-center justify-center rounded-full bg-brand-ink text-sm font-semibold text-white transition hover:bg-brand-purple ${
            compact ? 'px-4 py-3' : 'px-5 py-3.5'
          }`}
        >
          <ShoppingBag className="mr-2" size={17} aria-hidden="true" />
          Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
