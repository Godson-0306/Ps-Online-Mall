import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import PageMeta from '../components/PageMeta.jsx';

export default function AboutPage() {
  return (
    <>
      <PageMeta
        title="About"
        description="P's Online Mall is a Lagos-based premium marketplace for fashion, beauty, and lifestyle."
      />
      <Breadcrumb items={[{ label: 'About' }]} />
      <section className="bg-brand-mist py-12 sm:py-16">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Our story</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-brand-ink sm:text-5xl">
            Premium shopping, made personal.
          </h1>
        </Container>
      </section>
      <section className="py-16">
        <Container className="max-w-3xl space-y-6 text-sm leading-7 text-gray-600 sm:text-base">
          <p>
            P’s Online Mall started as a curated closet for people who want quality without the noise.
            We bring fashion, beauty, home, and everyday essentials into one refined marketplace.
          </p>
          <p>
            Every piece is checked before it ships. Packaging is gift-ready. Delivery covers major
            Nigerian cities, with simple returns when something is not the right fit.
          </p>
          <Button as={Link} to="/shop">
            Shop the edit
          </Button>
        </Container>
      </section>
    </>
  );
}
