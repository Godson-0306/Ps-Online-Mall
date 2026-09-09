import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import PageMeta from '../components/PageMeta.jsx';

export default function NotFoundPage() {
  return (
    <section className="py-24">
      <PageMeta title="Page not found" />
      <Container className="max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-brand-ink">This page is not in the mall.</h1>
        <p className="mt-4 text-sm leading-7 text-gray-500">
          The link may be outdated, or the product has moved. Head back to the shop and keep browsing.
        </p>
        <Button as={Link} to="/shop" className="mt-8">
          Go to shop
        </Button>
      </Container>
    </section>
  );
}
