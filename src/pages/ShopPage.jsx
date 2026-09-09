import { SlidersHorizontal, RotateCcw, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import Drawer from '../components/Drawer.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Newsletter from '../components/Newsletter.jsx';
import PageMeta from '../components/PageMeta.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts } from '../services/api.js';
import { enrichProducts, getCatalogFacets } from '../utils/enrichProducts.js';
import {
  matchesBrandParam,
  matchesCategoryParam,
  matchesCollection,
  matchesSearch,
} from '../utils/shopFilters.js';

const sortOptions = [
  ['newest', 'Newest'],
  ['price-asc', 'Price Low → High'],
  ['price-desc', 'Price High → Low'],
  ['popular', 'Most Popular'],
  ['rated', 'Highest Rated'],
  ['best-selling', 'Best Selling'],
];

const initialFilters = {
  categories: [],
  brands: [],
  rating: 0,
  availability: [],
  colors: [],
  sizes: [],
  maxPrice: 150000,
  discountOnly: false,
  newArrivals: false,
};

function toggleValue(values, nextValue) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-gray-100 py-5 first:pt-0 last:border-b-0">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-brand-ink">{title}</h3>
      {children}
    </div>
  );
}

function FilterPanel({ facets, filters, onChange, onReset }) {
  const checkboxClass =
    'h-4 w-4 rounded border-gray-300 text-brand-purple accent-brand-purple focus:ring-brand-purple';

  return (
    <aside className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-ink">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-purple"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset
        </button>
      </div>

      <FilterGroup title="Categories">
        <div className="space-y-3">
          {facets.categories.map((category) => (
            <label key={category} className="flex items-center gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={filters.categories.includes(category)}
                onChange={() =>
                  onChange({ ...filters, categories: toggleValue(filters.categories, category) })
                }
              />
              {category}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brands">
        <div className="space-y-3">
          {facets.brands.map((brand) => (
            <label key={brand} className="flex items-center gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={filters.brands.includes(brand)}
                onChange={() => onChange({ ...filters, brands: toggleValue(filters.brands, brand) })}
              />
              {brand}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price Range">
        <input
          type="range"
          min="20000"
          max="150000"
          step="5000"
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          className="w-full accent-brand-purple"
        />
        <p className="mt-2 text-sm font-semibold text-brand-purple">
          Up to ₦{filters.maxPrice.toLocaleString('en-NG')}
        </p>
      </FilterGroup>

      <FilterGroup title="Rating">
        <div className="space-y-3">
          {[4.8, 4.7, 4.6].map((rating) => (
            <label key={rating} className="flex items-center gap-3 text-sm text-gray-600">
              <input
                type="radio"
                name="rating"
                className={checkboxClass}
                checked={filters.rating === rating}
                onChange={() => onChange({ ...filters, rating })}
              />
              <span className="inline-flex items-center gap-1">
                {rating}+ <Star size={14} fill="currentColor" className="text-brand-gold" />
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-3">
          {facets.availability.map((item) => (
            <label key={item} className="flex items-center gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={filters.availability.includes(item)}
                onChange={() =>
                  onChange({
                    ...filters,
                    availability: toggleValue(filters.availability, item),
                  })
                }
              />
              {item}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colors">
        <div className="flex flex-wrap gap-2">
          {facets.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...filters, colors: toggleValue(filters.colors, color) })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.colors.includes(color)
                  ? 'border-brand-purple bg-brand-purple text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-purple'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Sizes">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ ...filters, sizes: toggleValue(filters.sizes, size) })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.sizes.includes(size)
                  ? 'border-brand-purple bg-brand-purple text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-purple'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="More">
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={filters.discountOnly}
              onChange={(event) => onChange({ ...filters, discountOnly: event.target.checked })}
            />
            Discount only
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={filters.newArrivals}
              onChange={(event) => onChange({ ...filters, newArrivals: event.target.checked })}
            />
            New arrivals
          </label>
        </div>
      </FilterGroup>
    </aside>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.5rem] bg-white shadow-soft">
          <div className="aspect-[4/5] animate-pulse bg-gray-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-11 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryParam = params.get('category') || '';
  const collectionParam = params.get('collection') || '';
  const brandParam = params.get('brand') || '';
  const searchQuery = params.get('q') || '';
  const viewParam = params.get('view') || '';
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const products = useMemo(() => enrichProducts(data), [data]);
  const facets = useMemo(() => getCatalogFacets(data), [data]);

  useEffect(() => {
    if (viewParam === 'categories') {
      document.getElementById('shop-filters')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewParam]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchCategories =
        filters.categories.length === 0 || filters.categories.includes(product.category);
      const matchBrands = filters.brands.length === 0 || filters.brands.includes(product.brand);
      const matchAvailability =
        filters.availability.length === 0 || filters.availability.includes(product.availability);
      const matchColors =
        filters.colors.length === 0 || product.colors.some((color) => filters.colors.includes(color));
      const matchSizes =
        filters.sizes.length === 0 || product.sizes.some((size) => filters.sizes.includes(size));
      const matchPrice = product.price <= filters.maxPrice;
      const matchRating = !filters.rating || product.rating >= filters.rating;
      const matchDiscount = !filters.discountOnly || product.discount > 0;
      const matchNew = !filters.newArrivals || product.isNew;

      return (
        matchCategories &&
        matchBrands &&
        matchAvailability &&
        matchColors &&
        matchSizes &&
        matchPrice &&
        matchRating &&
        matchDiscount &&
        matchNew &&
        matchesCategoryParam(product, categoryParam) &&
        matchesCollection(product, collectionParam) &&
        matchesBrandParam(product, brandParam) &&
        matchesSearch(product, searchQuery)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return b.popularity - a.popularity;
      if (sortBy === 'rated') return b.rating - a.rating;
      if (sortBy === 'best-selling') return b.sales - a.sales;
      return Number(b.isNew) - Number(a.isNew);
    });
  }, [brandParam, categoryParam, collectionParam, filters, products, searchQuery, sortBy]);

  const perPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);
  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
    navigate('/shop');
  };
  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  return (
    <>
      <PageMeta title="Shop" description="Browse fashion, beauty, lifestyle, and electronics at P's Online Mall." />
      <Breadcrumb items={[{ label: 'Shop' }]} />
        <section className="bg-brand-mist py-12 sm:py-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
                  Premium marketplace
                </p>
                <h1 className="mt-3 text-4xl font-semibold text-brand-ink sm:text-5xl">Shop</h1>
                {searchQuery ? (
                  <p className="mt-3 text-sm text-gray-500">Results for “{searchQuery}”</p>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-gray-500">
                {filteredProducts.length} products found
              </p>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 sm:py-16" id="shop-filters">
          <Container>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="mr-2" size={17} aria-hidden="true" />
                Filters
              </Button>
              <label className="ml-auto flex items-center gap-3 text-sm font-semibold text-gray-600">
                Sort by
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-brand-ink focus:border-brand-purple focus:outline-none"
                >
                  {sortOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
              <div className="hidden lg:block">
                <FilterPanel
                  facets={facets}
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                />
              </div>
              <div>
                {isLoading ? (
                  <ProductSkeletonGrid />
                ) : isError && !paginatedProducts.length ? (
                  <EmptyState
                    title="We could not load the catalog."
                    text="Check your connection and try again."
                  />
                ) : paginatedProducts.length ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </>
                ) : (
                  <EmptyState
                    title="Sorry, no products match your filters."
                    text="Try removing a few filters or explore the latest arrivals."
                  >
                    <Button type="button" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </EmptyState>
                )}
              </div>
            </div>
          </Container>
        </section>
        <Newsletter />
      <Drawer title="Filters" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <FilterPanel
          facets={facets}
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
        />
      </Drawer>
    </>
  );
}
