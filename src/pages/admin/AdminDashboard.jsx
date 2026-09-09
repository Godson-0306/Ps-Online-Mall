import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAdminStats } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { data, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats(token),
  });

  if (isError) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-soft">
        Start the API (`npm run dev:api`) and sign in as admin@psonlinemall.com to manage the mall.
      </p>
    );
  }

  const cards = [
    ['Products', data?.productCount ?? '—'],
    ['Orders', data?.orderCount ?? '—'],
    ['Revenue', data?.revenue != null ? formatCurrency(data.revenue) : '—'],
    ['Customers', data?.customerCount ?? '—'],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-[1.5rem] bg-white p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-brand-ink">{value}</p>
        </article>
      ))}
    </div>
  );
}
