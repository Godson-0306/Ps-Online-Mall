import Breadcrumb from '../components/Breadcrumb.jsx';
import Container from '../components/Container.jsx';
import PageMeta from '../components/PageMeta.jsx';

const copy = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Account details, order history, and the device information needed to complete checkout.'],
      ['How we use it', 'To fulfil orders, prevent fraud, send opted-in updates, and improve the mall.'],
      ['Storage', 'Data is stored securely and is not sold to third parties. Payment cards are handled by Paystack, not stored on our servers.'],
    ],
  },
  terms: {
    title: 'Terms of Use',
    sections: [
      ['Using the mall', 'You must provide accurate account information and keep your password private.'],
      ['Orders', 'Prices are in Nigerian Naira. An order is confirmed after payment is verified.'],
      ['Availability', 'We may refuse or cancel an order if an item is out of stock or listed in error.'],
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    sections: [
      ['Window', 'Unused items can be returned within 7 days of delivery in original packaging.'],
      ['Condition', 'Beauty and personal-care items can only be returned if sealed.'],
      ['Refunds', 'Approved refunds return to the original payment method after inspection.'],
    ],
  },
};

export default function LegalPage({ kind }) {
  const page = copy[kind] || copy.privacy;

  return (
    <>
      <PageMeta title={page.title} />
      <Breadcrumb items={[{ label: page.title }]} />
      <section className="bg-brand-mist py-12">
        <Container>
          <h1 className="text-4xl font-semibold text-brand-ink">{page.title}</h1>
        </Container>
      </section>
      <section className="py-16">
        <Container className="max-w-3xl space-y-8">
          {page.sections.map(([heading, text]) => (
            <div key={heading}>
              <h2 className="text-lg font-semibold text-brand-ink">{heading}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">{text}</p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
