import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import authImage from '../../images/2.png';
import Button from '../components/Button.jsx';
import Footer from '../components/Footer.jsx';
import Input from '../components/Input.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { forgotPassword, resetPassword } from '../services/api.js';
import logo from '../../images/logo.png';

const schemas = {
  login: z.object({
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    remember: z.boolean().optional(),
  }),
  register: z
    .object({
      name: z.string().min(2, 'Enter your full name.'),
      email: z.string().email('Enter a valid email address.'),
      password: z.string().min(8, 'Password must be at least 8 characters.'),
      confirmPassword: z.string().min(8, 'Confirm your password.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }),
  forgot: z.object({
    email: z.string().email('Enter a valid email address.'),
  }),
  reset: z
    .object({
      password: z.string().min(8, 'Password must be at least 8 characters.'),
      confirmPassword: z.string().min(8, 'Confirm your password.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }),
};

const copy = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Login to your account',
    text: 'Access wishlists, orders, and private shopping offers.',
    submit: 'Login',
    success: 'Welcome back.',
  },
  register: {
    eyebrow: 'Join P’s',
    title: 'Create your account',
    text: 'Save favorites, checkout faster, and receive tailored recommendations.',
    submit: 'Create Account',
    success: 'Account created. Welcome to P’s.',
  },
  forgot: {
    eyebrow: 'Password help',
    title: 'Reset your password',
    text: 'Enter your email and we will send reset instructions.',
    submit: 'Send Reset Link',
    success: 'If that email exists, reset instructions are on the way.',
  },
  reset: {
    eyebrow: 'New password',
    title: 'Set a new password',
    text: 'Choose a secure password to protect your shopping account.',
    submit: 'Update Password',
    success: 'Password updated. You can log in now.',
  },
};

function fieldClass(error) {
  return error ? 'border-red-300 bg-red-50/40' : '';
}

function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 text-xs font-semibold text-red-600"
    >
      {message}
    </motion.p>
  );
}

function PasswordField({ id, label, register, error, placeholder = 'Enter password' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-brand-ink">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={17}
          aria-hidden="true"
        />
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          className={`pl-11 pr-12 ${fieldClass(error)}`}
          {...register(id)}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <ErrorMessage message={error?.message} />
    </div>
  );
}

export default function AuthPage({ mode }) {
  const [serverMessage, setServerMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pageCopy = copy[mode];
  const schema = schemas[mode];
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, register: registerAccount } = useAuth();
  const { pushToast } = useToast();
  const resetToken = params.get('token') || '';
  const defaults = useMemo(
    () => ({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      remember: true,
    }),
    [],
  );
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: defaults });

  const onSubmit = async (values) => {
    setServerMessage('');
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.errors.forEach((error) => {
        setError(error.path[0], { type: 'manual', message: error.message });
      });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: parsed.data.email, password: parsed.data.password });
        pushToast(pageCopy.success);
        navigate('/account');
      } else if (mode === 'register') {
        await registerAccount({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
        });
        pushToast(pageCopy.success);
        navigate('/account');
      } else if (mode === 'forgot') {
        const result = await forgotPassword(parsed.data.email);
        setServerMessage(result.resetUrl ? `${pageCopy.success} ${result.resetUrl}` : pageCopy.success);
      } else {
        if (!resetToken) {
          setError('password', { type: 'manual', message: 'Reset token is missing.' });
          return;
        }
        await resetPassword({ token: resetToken, password: parsed.data.password });
        setServerMessage(pageCopy.success);
        navigate('/login');
      }
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Something went wrong.';
      setServerMessage('');
      pushToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-ink">
      <PageMeta title={pageCopy.title} />
      <main className="grid min-h-screen flex-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-brand-purple lg:block">
          <img src={authImage} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-brand-purple/55" />
          <div className="absolute inset-x-12 bottom-12 text-white">
            <img
              src={logo}
              alt="P's Online Mall"
              className="mb-8 h-20 w-auto rounded-2xl bg-white/95 object-contain p-2"
            />
            <h1 className="max-w-xl text-5xl font-semibold leading-tight">
              Premium shopping, made personal.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
              Continue your refined shopping experience with secure access to orders, saved
              products, and member-only offers.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Link to="/" className="mb-10 inline-flex lg:hidden">
              <img src={logo} alt="P's Online Mall" className="h-16 w-auto object-contain" />
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
              {pageCopy.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-brand-ink sm:text-4xl">
              {pageCopy.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-500">{pageCopy.text}</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {mode === 'register' ? (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-brand-ink">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                      aria-hidden="true"
                    />
                    <Input
                      id="name"
                      placeholder="Your name"
                      className={`pl-11 ${fieldClass(errors.name)}`}
                      {...register('name')}
                    />
                  </div>
                  <ErrorMessage message={errors.name?.message} />
                </div>
              ) : null}

              {mode !== 'reset' ? (
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-brand-ink">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`pl-11 ${fieldClass(errors.email)}`}
                      {...register('email')}
                    />
                  </div>
                  <ErrorMessage message={errors.email?.message} />
                </div>
              ) : null}

              {mode !== 'forgot' ? (
                <PasswordField
                  id="password"
                  label={mode === 'reset' ? 'New Password' : 'Password'}
                  register={register}
                  error={errors.password}
                />
              ) : null}

              {mode === 'register' || mode === 'reset' ? (
                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  register={register}
                  error={errors.confirmPassword}
                  placeholder="Confirm password"
                />
              ) : null}

              {mode === 'login' ? (
                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 font-medium text-gray-600">
                    <input type="checkbox" className="accent-brand-purple" {...register('remember')} />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="font-semibold text-brand-purple">
                    Forgot password?
                  </Link>
                </div>
              ) : null}

              {serverMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
                >
                  {serverMessage}
                </motion.div>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Please wait...' : pageCopy.submit}
              </Button>

              <button
                type="button"
                onClick={() => pushToast('Google sign-in will be added after email auth is live.', 'info')}
                className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-purple hover:text-brand-purple"
              >
                Continue with Google
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>
                  New here?{' '}
                  <Link to="/register" className="font-semibold text-brand-purple">
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-brand-purple">
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
