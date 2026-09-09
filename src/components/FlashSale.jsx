import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import Container from './Container.jsx';
import SectionTitle from './SectionTitle.jsx';

function pad(value) {
  return String(value).padStart(2, '0');
}

export default function FlashSale({ products }) {
  const endsAt = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    return end.getTime();
  }, []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, endsAt - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <section className="bg-brand-mist py-20 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Flash sale"
          title="Limited-time luxury finds"
          description="Move quickly on elevated essentials with exclusive savings."
        />
        <div className="mb-8 flex items-center justify-center gap-3 text-sm font-semibold text-brand-ink">
          <span className="text-gray-500">Ends in</span>
          {[hours, minutes, seconds].map((unit, index) => (
            <span
              key={index}
              className="inline-flex min-w-12 items-center justify-center rounded-full bg-brand-purple px-3 py-2 text-white"
            >
              {pad(unit)}
            </span>
          ))}
        </div>
        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-5 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {products.map((product) => (
            <div key={product.id} className="w-72 shrink-0 snap-start sm:w-80">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
