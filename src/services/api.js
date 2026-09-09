import axios from 'axios';
import { brands, categories, heroSlides, products } from '../data/fallbackData.js';
import { readStorage, writeStorage } from '../utils/storage.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

function unwrap(data) {
  return data?.data ?? data;
}

async function withFallback(request, fallback, validate = Boolean) {
  try {
    const { data } = await request();
    const payload = unwrap(data);
    return validate(payload) ? payload : fallback;
  } catch {
    return fallback;
  }
}

const isArray = (value) => Array.isArray(value);

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getHeroSlides() {
  return withFallback(() => api.get('/banners'), heroSlides, isArray);
}

export function getCategories() {
  return withFallback(() => api.get('/categories'), categories, isArray);
}

export function getProducts() {
  return withFallback(() => api.get('/products'), products, isArray);
}

export function getFeaturedProducts() {
  return withFallback(() => api.get('/products/featured'), products, isArray);
}

export function getBrands() {
  return withFallback(() => api.get('/brands'), brands, isArray);
}

export async function getProductById(id) {
  try {
    const { data } = await api.get(`/products/${id}`);
    return unwrap(data);
  } catch {
    return products.find((product) => product.id === id) || null;
  }
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return unwrap(data);
}

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return unwrap(data);
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot', { email });
  return unwrap(data);
}

export async function resetPassword({ token, password }) {
  const { data } = await api.post('/auth/reset', { token, password });
  return unwrap(data);
}

export async function getCurrentUser(token) {
  const { data } = await api.get('/auth/me', { headers: authHeaders(token) });
  return unwrap(data);
}

export async function subscribeNewsletter(email) {
  try {
    const { data } = await api.post('/newsletter', { email });
    return unwrap(data);
  } catch {
    const list = readStorage('newsletter', []);
    if (!list.includes(email)) {
      writeStorage('newsletter', [...list, email]);
    }
    return { email };
  }
}

export async function sendContactMessage(payload) {
  try {
    const { data } = await api.post('/contact', payload);
    return unwrap(data);
  } catch {
    const messages = readStorage('contact-messages', []);
    writeStorage('contact-messages', [...messages, { ...payload, createdAt: Date.now() }]);
    return { ok: true };
  }
}

export async function validateCoupon(code, token) {
  const { data } = await api.post(
    '/coupons/validate',
    { code },
    { headers: authHeaders(token) },
  );
  return unwrap(data);
}

export async function createOrder(payload, token) {
  const { data } = await api.post('/orders', payload, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function getOrders(token) {
  const { data } = await api.get('/orders', { headers: authHeaders(token) });
  return unwrap(data);
}

export async function getOrder(id, token) {
  const { data } = await api.get(`/orders/${id}`, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function getAdminStats(token) {
  const { data } = await api.get('/admin/stats', { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminListProducts(token) {
  const { data } = await api.get('/admin/products', { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminSaveProduct(product, token) {
  const method = product.id && product._existing ? 'put' : 'post';
  const url = method === 'put' ? `/admin/products/${product.id}` : '/admin/products';
  const { data } = await api[method](url, product, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminUpdateProduct(id, product, token) {
  const { data } = await api.put(`/admin/products/${id}`, product, {
    headers: authHeaders(token),
  });
  return unwrap(data);
}

export async function adminCreateProduct(product, token) {
  const { data } = await api.post('/admin/products', product, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminDeleteProduct(id, token) {
  const { data } = await api.delete(`/admin/products/${id}`, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminListOrders(token) {
  const { data } = await api.get('/admin/orders', { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminUpdateOrder(id, status, token) {
  const { data } = await api.patch(
    `/admin/orders/${id}`,
    { status },
    { headers: authHeaders(token) },
  );
  return unwrap(data);
}

export async function adminListCoupons(token) {
  const { data } = await api.get('/admin/coupons', { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminSaveCoupon(coupon, token) {
  const { data } = await api.post('/admin/coupons', coupon, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminDeleteCoupon(code, token) {
  const { data } = await api.delete(`/admin/coupons/${code}`, { headers: authHeaders(token) });
  return unwrap(data);
}

export async function adminUploadImage(file, token) {
  const body = new FormData();
  body.append('image', file);
  const { data } = await api.post('/admin/upload', body, {
    headers: { ...authHeaders(token), 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(data);
}

export { api };
