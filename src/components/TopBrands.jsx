import { Link } from 'react-router-dom';
import Container from './Container.jsx';
import SectionTitle from './SectionTitle.jsx';

export default function TopBrands({ brands }) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Top brands"
          title="Names our shoppers come back for"
          description="Premium labels and emerging makers, curated for quality and lasting style."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <Link
              key={brand}
              to={`/shop?brand=${encodeURIComponent(brand)}`}
              className="flex h-28 items-center justify-center rounded-[1.25rem] border border-gray-100 bg-brand-mist px-4 text-center text-lg font-black text-brand-ink shadow-sm transition hover:border-brand-gold/50 hover:bg-white hover:shadow-soft"
            >
              {brand}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
