import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../context/ToastContext.jsx';

export default function Toast() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={() => dismiss(toast.id)}
            className={`pointer-events-auto max-w-md rounded-full px-5 py-3 text-sm font-semibold shadow-lift ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : toast.type === 'info'
                  ? 'bg-brand-ink text-white'
                  : 'bg-brand-purple text-white'
            }`}
          >
            {toast.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
