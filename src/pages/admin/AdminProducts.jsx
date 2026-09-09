import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminDeleteProduct, adminListProducts } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function AdminProducts() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { data = [], refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminListProducts(token),
  });

  const remove = async (id) => {
    try {
      await adminDeleteProduct(id, token);
      pushToast('Product removed');
      refetch();
    } catch (error) {
      pushToast(error.response?.data?.error || 'Could not delete product.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button as={Link} to="/admin/products/new">
          Add product
        </Button>
      </div>
      <div className="overflow-x-auto rounded-[1.5rem] bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-semibold">{product.name}</td>
                <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">{product.stock ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="mr-3 font-semibold text-brand-purple"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="font-semibold text-red-600"
                    onClick={() => remove(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
