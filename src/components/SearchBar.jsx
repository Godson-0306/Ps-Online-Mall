import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchBar({ className = '', id = 'site-search' }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  const onSubmit = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop');
  };

  return (
    <form className={`relative ${className}`} role="search" onSubmit={onSubmit}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4"
        size={18}
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search dresses, bags, beauty..."
        className="h-11 w-full rounded-full border border-gray-200 bg-brand-mist pl-10 pr-4 text-sm text-brand-ink transition placeholder:text-gray-400 focus:border-brand-purple focus:bg-white focus:outline-none sm:h-12 sm:pl-11"
      />
    </form>
  );
}
