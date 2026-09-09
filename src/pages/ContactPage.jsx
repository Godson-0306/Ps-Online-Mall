import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Button from '../components/Button.jsx';
import Container from '../components/Container.jsx';
import Input from '../components/Input.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { sendContactMessage } from '../services/api.js';

export default function ContactPage() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', email: '', message: '' },
  });
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await sendContactMessage(values);
      reset();
      pushToast('Message received. We will reply shortly.');
    } catch (error) {
      pushToast(error.message || 'Could not send your message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Contact" description="Reach P's Online Mall in Lagos." />
      <Breadcrumb items={[{ label: 'Contact' }]} />
      <section className="bg-brand-mist py-12 sm:py-16">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Hello</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand-ink sm:text-5xl">Contact us</h1>
        </Container>
      </section>
      <section className="py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 text-sm leading-7 text-gray-600">
            <p>Victoria Island, Lagos, Nigeria</p>
            <p>
              <a className="font-semibold text-brand-purple" href="mailto:hello@psonlinemall.com">
                hello@psonlinemall.com
              </a>
            </p>
            <p>
              <a className="font-semibold text-brand-purple" href="tel:+2342013301840">
                +234 201 330 1840
              </a>
            </p>
            <p>Monday to Saturday, 9am – 6pm WAT.</p>
          </div>
          <form className="space-y-4 rounded-[1.75rem] bg-white p-6 shadow-soft" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">
                Name
              </label>
              <Input id="contact-name" required {...register('name')} />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">
                Email
              </label>
              <Input id="contact-email" type="email" required {...register('email')} />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                className="w-full rounded-[1.25rem] border border-gray-200 px-5 py-3 text-sm"
                {...register('message')}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send message'}
            </Button>
          </form>
        </Container>
      </section>
    </>
  );
}
