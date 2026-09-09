import { Send } from 'lucide-react';
import { useState } from 'react';
import { subscribeNewsletter } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Container from './Container.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';

export default function Newsletter() {
  const { pushToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      pushToast('Enter your email to subscribe.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await subscribeNewsletter(value);
      setEmail('');
      pushToast('You are on the P’s list. Welcome in.');
    } catch (error) {
      pushToast(error.message || 'Could not subscribe just now.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-brand-mist py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white px-6 py-12 text-center shadow-soft sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
            Newsletter
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ink sm:text-4xl">
            First look at new drops and private offers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            Join the P's list for refined edits, early sale access, and weekly shopping inspiration.
          </p>
          <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="sm:flex-1"
            />
            <Button type="submit" className="shrink-0" disabled={submitting}>
              <Send className="mr-2" size={17} aria-hidden="true" />
              {submitting ? 'Joining...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
