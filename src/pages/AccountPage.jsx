import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Container from '../components/Container.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccountPage() {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <PageMeta title="Account" />
      <Breadcrumb items={[{ label: 'Account' }]} />
      <section className="bg-brand-mist py-12">
        <Container>
          <h1 className="text-4xl font-semibold text-brand-ink">Hello, {user?.name}</h1>
          <p className="mt-3 text-sm text-gray-500">{user?.email}</p>
        </Container>
      </section>
      <section className="py-16">
        <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Orders', 'Track deliveries and past purchases.', '/account/orders'],
            ['Wishlist', 'Pieces you have saved.', '/wishlist'],
            isAdmin ? ['Admin', 'Catalog, orders, and coupons.', '/admin'] : null,
          ]
            .filter(Boolean)
            .map(([title, text, href]) => (
              <Link
                key={title}
                to={href}
                className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-soft transition hover:shadow-lift"
              >
                <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
                <p className="mt-2 text-sm text-gray-500">{text}</p>
              </Link>
            ))}
        </Container>
      </section>
    </>
  );
}
