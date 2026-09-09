import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { seedBanners, seedCategories, seedCoupons, seedProducts } from './seed-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'data.json');

function withGallery(product) {
  return {
    ...product,
    gallery: product.gallery || [product.image, product.image, product.image],
  };
}

function emptyState() {
  return {
    users: [],
    products: [],
    categories: [],
    banners: [],
    coupons: [],
    orders: [],
    newsletter: [],
    contacts: [],
    resets: [],
  };
}

let state = emptyState();

function persist() {
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

export async function init() {
  if (fs.existsSync(dataFile)) {
    try {
      state = { ...emptyState(), ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) };
    } catch {
      state = emptyState();
    }
  }

  if (!state.products.length) {
    state.products = seedProducts.map(withGallery);
    state.categories = seedCategories;
    state.banners = seedBanners;
    state.coupons = seedCoupons;
  }

  if (!state.users.length) {
    state.users = [
      {
        id: randomUUID(),
        name: 'Mall Admin',
        email: 'admin@psonlinemall.com',
        passwordHash: bcrypt.hashSync('Admin1234!', 10),
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        name: 'Demo Shopper',
        email: 'demo@psonlinemall.com',
        passwordHash: bcrypt.hashSync('Demo1234!', 10),
        role: 'customer',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  persist();
}

export async function getBanners() {
  return state.banners;
}

export async function getCategories() {
  return state.categories;
}

export async function getBrands() {
  return [...new Set(state.products.map((product) => product.brand).filter(Boolean))];
}

export async function getProducts() {
  return state.products;
}

export async function getFeaturedProducts() {
  return state.products.filter((product) => product.isFeatured);
}

export async function getProduct(id) {
  return state.products.find((product) => product.id === id) || null;
}

export async function createUser({ name, email, passwordHash, role = 'customer' }) {
  const user = {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);
  persist();
  return user;
}

export async function findUserByEmail(email) {
  return state.users.find((user) => user.email === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  return state.users.find((user) => user.id === id) || null;
}

export async function updateUserPassword(id, passwordHash) {
  const user = await findUserById(id);
  if (user) {
    user.passwordHash = passwordHash;
    persist();
  }
  return user;
}

export async function createResetToken(userId, token, expiresAt) {
  state.resets = state.resets.filter((item) => item.userId !== userId);
  state.resets.push({ token, userId, expiresAt });
  persist();
}

export async function consumeResetToken(token) {
  const record = state.resets.find((item) => item.token === token);
  if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
    return null;
  }
  state.resets = state.resets.filter((item) => item.token !== token);
  persist();
  return record;
}

export async function saveNewsletter(email) {
  if (!state.newsletter.includes(email)) {
    state.newsletter.push(email);
    persist();
  }
  return { email };
}

export async function saveContact(payload) {
  state.contacts.push({ ...payload, id: randomUUID(), createdAt: new Date().toISOString() });
  persist();
  return { ok: true };
}

export async function validateCoupon(code) {
  const coupon = state.coupons.find(
    (item) => item.code.toUpperCase() === String(code || '').toUpperCase() && item.active,
  );
  return coupon || null;
}

export async function listCoupons() {
  return state.coupons;
}

export async function saveCoupon(coupon) {
  const code = coupon.code.toUpperCase();
  const next = { code, percent: Number(coupon.percent), active: coupon.active !== false };
  state.coupons = [...state.coupons.filter((item) => item.code !== code), next];
  persist();
  return next;
}

export async function deleteCoupon(code) {
  state.coupons = state.coupons.filter((item) => item.code !== code.toUpperCase());
  persist();
}

export async function createOrder(order) {
  const saved = { ...order, id: order.id || randomUUID() };
  state.orders.unshift(saved);
  persist();
  return saved;
}

export async function getOrder(id) {
  return state.orders.find((order) => order.id === id || order.paystackReference === id) || null;
}

export async function listOrders({ userId, all = false } = {}) {
  if (all) {
    return state.orders;
  }
  return state.orders.filter((order) => order.userId === userId || order.email);
}

export async function listOrdersForUser(userId, email) {
  return state.orders.filter((order) => order.userId === userId || order.email === email);
}

export async function updateOrder(id, fields) {
  const order = await getOrder(id);
  if (!order) {
    return null;
  }
  Object.assign(order, fields);
  persist();
  return order;
}

export async function createProduct(product) {
  const saved = withGallery({
    ...product,
    id: product.id || randomUUID(),
    rating: product.rating || 4.8,
    popularity: product.popularity || 80,
    sales: product.sales || 0,
  });
  state.products.unshift(saved);
  persist();
  return saved;
}

export async function updateProduct(id, product) {
  const index = state.products.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  state.products[index] = withGallery({ ...state.products[index], ...product, id });
  persist();
  return state.products[index];
}

export async function deleteProduct(id) {
  state.products = state.products.filter((item) => item.id !== id);
  persist();
}

export async function stats() {
  const paid = state.orders.filter((order) => ['paid', 'packed', 'shipped', 'delivered'].includes(order.status));
  return {
    productCount: state.products.length,
    orderCount: state.orders.length,
    customerCount: state.users.filter((user) => user.role !== 'admin').length,
    revenue: paid.reduce((total, order) => total + Number(order.total || 0), 0),
  };
}
