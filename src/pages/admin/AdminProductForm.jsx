import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  adminCreateProduct,
  adminListProducts,
  adminUpdateProduct,
  adminUploadImage,
} from '../../services/api.js';

const emptyProduct = {
  name: '',
  price: 0,
  originalPrice: 0,
  category: 'Clothes',
  brand: 'Maison PS',
  image: '',
  description: '',
  stock: 20,
  discount: 0,
  isFeatured: true,
  isFlashSale: false,
  isNew: true,
  colors: 'Purple, Black',
  sizes: 'S, M, L',
};

export default function AdminProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminListProducts(token),
    enabled: Boolean(productId),
  });

  useEffect(() => {
    if (!productId) {
      return;
    }
    const existing = data.find((item) => item.id === productId);
    if (existing) {
      setForm({
        ...emptyProduct,
        ...existing,
        colors: (existing.colors || []).join(', '),
        sizes: (existing.sizes || []).join(', '),
      });
    }
  }, [data, productId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const uploaded = await adminUploadImage(file, token);
      update('image', uploaded.url);
      pushToast('Image uploaded');
    } catch (error) {
      pushToast(error.response?.data?.error || 'Upload failed.', 'error');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || 0,
      stock: Number(form.stock),
      discount: Number(form.discount) || 0,
      colors: String(form.colors)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      sizes: String(form.sizes)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
    try {
      if (productId) {
        await adminUpdateProduct(productId, payload, token);
      } else {
        await adminCreateProduct(payload, token);
      }
      pushToast('Product saved');
      navigate('/admin/products');
    } catch (error) {
      pushToast(error.response?.data?.error || 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="max-w-2xl space-y-4 rounded-[1.5rem] bg-white p-6 shadow-soft" onSubmit={onSubmit}>
      <h2 className="text-2xl font-semibold">{productId ? 'Edit product' : 'New product'}</h2>
      <Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Name" required />
      <Input
        type="number"
        value={form.price}
        onChange={(event) => update('price', event.target.value)}
        placeholder="Price"
        required
      />
      <Input
        value={form.category}
        onChange={(event) => update('category', event.target.value)}
        placeholder="Category"
      />
      <Input value={form.brand} onChange={(event) => update('brand', event.target.value)} placeholder="Brand" />
      <Input
        value={form.image}
        onChange={(event) => update('image', event.target.value)}
        placeholder="Image URL"
      />
      <input type="file" accept="image/*" onChange={onUpload} />
      {form.image ? <img src={form.image} alt="" className="h-32 rounded-2xl object-cover" /> : null}
      <textarea
        className="w-full rounded-[1.25rem] border border-gray-200 px-5 py-3 text-sm"
        rows={4}
        value={form.description}
        onChange={(event) => update('description', event.target.value)}
        placeholder="Description"
      />
      <Input value={form.colors} onChange={(event) => update('colors', event.target.value)} placeholder="Colors" />
      <Input value={form.sizes} onChange={(event) => update('sizes', event.target.value)} placeholder="Sizes" />
      <Input
        type="number"
        value={form.stock}
        onChange={(event) => update('stock', event.target.value)}
        placeholder="Stock"
      />
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save product'}
      </Button>
    </form>
  );
}
