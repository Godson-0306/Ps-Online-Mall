import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageMeta from '../components/PageMeta.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <>
      <PageMeta title="Wishlist" />
      <Breadcrumb items={[{ label: 'Wishlist' }]} />
      <section className="bg-brand-mist py-12">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Saved</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand-ink">Wishlist</h1>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          {items.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing saved yet."
              text="Tap the heart on a product to keep it here."
            >
              <Button as={Link} to="/shop">
                <ShoppingBag className="mr-2" size={17} />
                Browse the shop
              </Button>
            </EmptyState>
          )}
        </Container>
      </section>
    </>
  );
}
