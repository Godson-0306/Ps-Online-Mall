import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import Container from './Container.jsx';

const links = [
  ['Home', '/'],
  ['Shop', '/shop'],
  ['New Arrivals', '/shop?collection=new-arrivals'],
  ['Deals', '/shop?collection=deals'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

const footerCategories = [
  ['Clothes', '/shop?category=clothes'],
  ['Shoes', '/shop?category=shoes'],
  ['Perfumes', '/shop?category=perfumes'],
  ['Bags', '/shop?category=bags'],
  ['Electronics', '/shop?category=electronics'],
  ['Beauty', '/shop?category=beauty'],
];

const legalLinks = [
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
  ['Returns', '/returns'],
];

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <img
              src={logo}
              alt="P's Online Mall"
              className="h-16 w-auto rounded-2xl bg-white/95 object-contain p-2"
            />
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              A premium online mall for fashion, beauty, lifestyle, gifting, and everyday essentials.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                ['Instagram', Instagram, 'https://instagram.com'],
                ['Facebook', Facebook, 'https://facebook.com'],
                ['Twitter', Twitter, 'https://x.com'],
              ].map(([label, Icon, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand-gold hover:text-brand-ink"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Quick Links</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="transition hover:text-brand-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Categories</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              {footerCategories.map(([category, href]) => (
                <li key={category}>
                  <Link to={href} className="transition hover:text-brand-gold">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Contact</h2>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 shrink-0 text-brand-gold" size={18} aria-hidden="true" />
                Victoria Island, Lagos, Nigeria
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 shrink-0 text-brand-gold" size={18} aria-hidden="true" />
                <a href="tel:+2342013301840" className="hover:text-brand-gold">
                  +234 201 330 1840
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 shrink-0 text-brand-gold" size={18} aria-hidden="true" />
                <a href="mailto:hello@psonlinemall.com" className="hover:text-brand-gold">
                  hello@psonlinemall.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} P's Online Mall. All rights reserved.</p>
          <div className="flex gap-4">
            {legalLinks.map(([label, href]) => (
              <Link key={label} to={href} className="hover:text-brand-gold">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
