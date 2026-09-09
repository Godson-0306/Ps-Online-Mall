import { NavLink, Outlet } from 'react-router-dom';
import Container from '../../components/Container.jsx';
import PageMeta from '../../components/PageMeta.jsx';

const links = [
  ['Overview', '/admin'],
  ['Products', '/admin/products'],
  ['Orders', '/admin/orders'],
  ['Coupons', '/admin/coupons'],
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <PageMeta title="Admin" />
      <div className="border-b border-gray-200 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-5">
          <h1 className="text-xl font-semibold text-brand-ink">Mall admin</h1>
          <nav className="flex flex-wrap gap-2">
            {links.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/admin'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive ? 'bg-brand-purple text-white' : 'bg-brand-mist text-brand-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink to="/" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500">
              View store
            </NavLink>
          </nav>
        </Container>
      </div>
      <Container className="py-10">
        <Outlet />
      </Container>
    </div>
  );
}
