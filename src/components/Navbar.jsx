import { Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import Container from './Container.jsx';
import SearchBar from './SearchBar.jsx';

const navItems = [
  ['Home', '/'],
  ['Shop', '/shop'],
  ['Categories', '/shop?view=categories'],
  ['New Arrivals', '/shop?collection=new-arrivals'],
  ['Deals', '/shop?collection=deals'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

function IconLink({ label, to, count = 0, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-ink transition hover:border-brand-purple/30 hover:text-brand-purple sm:h-11 sm:w-11"
    >
      {children}
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold leading-none text-brand-ink">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
      <Container>
        <div className="relative flex h-14 items-center gap-2 sm:h-16 sm:gap-3 lg:min-h-20 lg:gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-brand-ink lg:hidden"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <Link
            to="/"
            className="absolute left-1/2 flex min-w-0 -translate-x-1/2 items-center lg:static lg:left-auto lg:translate-x-0"
            aria-label="P's Online Mall home"
          >
            <img
              src={logo}
              alt="P's Online Mall"
              className="h-9 w-auto max-w-[7.5rem] rounded-md object-contain sm:h-12 sm:max-w-[10rem] lg:h-16 lg:max-w-[13rem]"
            />
          </Link>

          <SearchBar id="site-search" className="mx-auto hidden max-w-xl flex-1 lg:block" />

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <IconLink label="Wishlist" to="/wishlist" count={wishlistCount}>
              <Heart size={18} aria-hidden="true" />
            </IconLink>
            <IconLink label="Shopping cart" to="/cart" count={count}>
              <ShoppingBag size={18} aria-hidden="true" />
            </IconLink>
            <div className="relative hidden md:block">
              <button
                type="button"
                className="inline-flex rounded-full bg-brand-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple"
                onClick={() => {
                  if (isAuthenticated) {
                    setAccountOpen((openMenu) => !openMenu);
                  } else {
                    navigate('/login');
                  }
                }}
              >
                <UserRound className="mr-2" size={17} aria-hidden="true" />
                {isAuthenticated ? user.name.split(' ')[0] : 'Account'}
              </button>
              {accountOpen && isAuthenticated ? (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-lift">
                  <Link
                    to="/account"
                    onClick={() => setAccountOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-mist"
                  >
                    My account
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setAccountOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-mist"
                  >
                    Orders
                  </Link>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-mist"
                    >
                      Admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                      navigate('/');
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pb-2.5 lg:hidden">
          <SearchBar id="site-search-mobile" />
        </div>

        <nav className="hidden items-center justify-center gap-9 border-t border-gray-100 py-4 text-sm font-semibold text-gray-600 lg:flex">
          {navItems.map(([label, href]) => (
            <NavLink
              key={label}
              to={href}
              className={({ isActive }) =>
                `transition hover:text-brand-purple ${
                  isActive && href === '/' ? 'text-brand-purple' : ''
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </header>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-brand-ink/45"
            onClick={closeMenu}
          />
          <div className="relative z-10 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <Link to="/" className="flex min-w-0 items-center" aria-label="P's Online Mall home">
                <img
                  src={logo}
                  alt="P's Online Mall"
                  className="h-10 w-auto max-w-[9rem] rounded-md object-contain"
                />
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200"
                onClick={closeMenu}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="grid gap-1">
                {navItems.map(([label, href]) => (
                  <Link
                    key={label}
                    to={href}
                    onClick={closeMenu}
                    className="rounded-2xl px-4 py-3 text-base font-semibold text-brand-ink transition hover:bg-brand-mist hover:text-brand-purple"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 grid gap-1 border-t border-gray-100 pt-4">
                <Link
                  to="/wishlist"
                  onClick={closeMenu}
                  className="rounded-2xl px-4 py-3 text-base font-semibold text-brand-ink transition hover:bg-brand-mist hover:text-brand-purple"
                >
                  Wishlist
                </Link>
                <Link
                  to="/cart"
                  onClick={closeMenu}
                  className="rounded-2xl px-4 py-3 text-base font-semibold text-brand-ink transition hover:bg-brand-mist hover:text-brand-purple"
                >
                  Cart
                </Link>
                <Link
                  to={isAuthenticated ? '/account' : '/login'}
                  onClick={closeMenu}
                  className="rounded-2xl px-4 py-3 text-base font-semibold text-brand-ink transition hover:bg-brand-mist hover:text-brand-purple"
                >
                  {isAuthenticated ? 'My account' : 'Login'}
                </Link>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenu();
                      navigate('/');
                    }}
                    className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                ) : null}
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
