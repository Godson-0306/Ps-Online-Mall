import { createHmac, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import * as store from './store.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'ps-online-mall-dev-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname || '.jpg') || '.jpg';
      callback(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const app = express();
app.disable('x-powered-by');

app.post('/api/webhooks/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(200).json({ ignored: true });
  }
  const signature = req.headers['x-paystack-signature'];
  const hash = createHmac('sha512', secret).update(req.body).digest('hex');
  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  const event = JSON.parse(req.body.toString('utf8'));
  const reference = event?.data?.reference;
  if (event.event === 'charge.success' && reference) {
    await store.updateOrder(reference, { status: 'paid', paystackReference: reference });
  }
  return res.json({ received: true });
});

app.use(cors({ origin: FRONTEND_URL === '*' ? true : [FRONTEND_URL, 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

function publicUser(user) {
  if (!user) {
    return null;
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function requireUser(req, res, next) {
  const payload = readToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Please log in.' });
  }
  const user = await store.findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'Please log in.' });
  }
  req.user = user;
  return next();
}

async function optionalUser(req, _res, next) {
  const payload = readToken(req);
  req.user = payload ? await store.findUserById(payload.sub) : null;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
}

function slugify(value) {
  return String(value || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

async function initializePaystack({ email, amount, reference, callbackUrl }) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { authorization_url: `${FRONTEND_URL}/orders/${reference}/confirmation`, reference, demo: true };
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(Number(amount) * 100),
      reference,
      callback_url: callbackUrl,
    }),
  });
  const payload = await response.json();
  if (!payload.status) {
    throw new Error(payload.message || 'Paystack initialize failed');
  }
  return payload.data;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: process.env.DATABASE_URL ? 'postgres' : 'memory' });
});

app.get('/api/banners', async (_req, res) => {
  res.json(await store.getBanners());
});

app.get('/api/categories', async (_req, res) => {
  res.json(await store.getCategories());
});

app.get('/api/brands', async (_req, res) => {
  res.json(await store.getBrands());
});

app.get('/api/products/featured', async (_req, res) => {
  res.json(await store.getFeaturedProducts());
});

app.get('/api/products', async (_req, res) => {
  res.json(await store.getProducts());
});

app.get('/api/products/:id', async (req, res) => {
  const product = await store.getProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json(product);
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  const existing = await store.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }
  const user = await store.createUser({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  return res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await store.findUserByEmail(email || '');
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  return res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', requireUser, (req, res) => {
  res.json(publicUser(req.user));
});

app.post('/api/auth/forgot', async (req, res) => {
  const email = req.body?.email || '';
  const user = await store.findUserByEmail(email);
  if (!user) {
    return res.json({ message: 'If that email exists, reset instructions are on the way.' });
  }
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  await store.createResetToken(user.id, token, expiresAt);
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  return res.json({
    message: 'If that email exists, reset instructions are on the way.',
    resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl,
  });
});

app.post('/api/auth/reset', async (req, res) => {
  const { token, password } = req.body || {};
  const record = await store.consumeResetToken(token);
  if (!record) {
    return res.status(400).json({ error: 'Reset link is invalid or expired.' });
  }
  await store.updateUserPassword(record.userId, bcrypt.hashSync(password, 10));
  return res.json({ ok: true });
});

app.post('/api/newsletter', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  res.json(await store.saveNewsletter(email));
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All contact fields are required.' });
  }
  res.json(await store.saveContact({ name, email, message }));
});

app.post('/api/coupons/validate', async (req, res) => {
  const coupon = await store.validateCoupon(req.body?.code);
  if (!coupon) {
    return res.status(404).json({ error: 'Coupon is not valid.' });
  }
  res.json(coupon);
});

app.post('/api/orders', optionalUser, async (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  const coupon = body.coupon ? await store.validateCoupon(body.coupon) : null;
  const subtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
  const shipping = subtotal > 75000 || subtotal === 0 ? 0 : 6500;
  const discount = coupon ? Math.round(subtotal * (Number(coupon.percent) / 100)) : 0;
  const tax = Math.round(subtotal * 0.075);
  const total = Math.max(0, subtotal + shipping + tax - discount);
  const orderId = randomUUID();
  const paystackReference = orderId;
  const demoPaystack = !process.env.PAYSTACK_SECRET_KEY;

  let authorizationUrl = `${FRONTEND_URL}/orders/${orderId}/confirmation`;
  try {
    const paystack = await initializePaystack({
      email: body.email,
      amount: total,
      reference: paystackReference,
      callbackUrl: `${FRONTEND_URL}/orders/${orderId}/confirmation`,
    });
    authorizationUrl = paystack.authorization_url;
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Payment provider unavailable.' });
  }

  const order = await store.createOrder({
    id: orderId,
    userId: req.user?.id || null,
    email: body.email,
    name: body.name,
    phone: body.phone,
    address: body.address,
    city: body.city,
    state: body.state,
    status: demoPaystack ? 'paid' : 'pending',
    subtotal,
    shipping,
    discount,
    tax,
    total,
    coupon: coupon?.code || '',
    paystackReference,
    items,
  });

  res.status(201).json({
    ...order,
    authorizationUrl,
    demo: demoPaystack,
  });
});

app.get('/api/orders', requireUser, async (req, res) => {
  res.json(await store.listOrdersForUser(req.user.id, req.user.email));
});

app.get('/api/orders/:id', optionalUser, async (req, res) => {
  const order = await store.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  if (req.user && req.user.role !== 'admin' && order.userId && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed.' });
  }
  return res.json(order);
});

app.get('/api/admin/stats', requireUser, requireAdmin, async (_req, res) => {
  res.json(await store.stats());
});

app.get('/api/admin/products', requireUser, requireAdmin, async (_req, res) => {
  res.json(await store.getProducts());
});

app.post('/api/admin/products', requireUser, requireAdmin, async (req, res) => {
  const product = req.body || {};
  if (!product.name || !product.price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }
  const saved = await store.createProduct({
    ...product,
    id: product.id || slugify(product.name),
  });
  res.status(201).json(saved);
});

app.put('/api/admin/products/:id', requireUser, requireAdmin, async (req, res) => {
  const saved = await store.updateProduct(req.params.id, req.body || {});
  if (!saved) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(saved);
});

app.delete('/api/admin/products/:id', requireUser, requireAdmin, async (req, res) => {
  await store.deleteProduct(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/orders', requireUser, requireAdmin, async (_req, res) => {
  res.json(await store.listOrders({ all: true }));
});

app.patch('/api/admin/orders/:id', requireUser, requireAdmin, async (req, res) => {
  const order = await store.updateOrder(req.params.id, { status: req.body?.status });
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(order);
});

app.get('/api/admin/coupons', requireUser, requireAdmin, async (_req, res) => {
  res.json(await store.listCoupons());
});

app.post('/api/admin/coupons', requireUser, requireAdmin, async (req, res) => {
  if (!req.body?.code) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }
  res.status(201).json(await store.saveCoupon(req.body));
});

app.delete('/api/admin/coupons/:code', requireUser, requireAdmin, async (req, res) => {
  await store.deleteCoupon(req.params.code);
  res.json({ ok: true });
});

app.post('/api/admin/upload', requireUser, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Choose an image to upload.' });
  }

  if (process.env.CLOUDINARY_URL) {
    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config(true);
      const uploaded = await cloudinary.uploader.upload(req.file.path, { folder: 'ps-online-mall' });
      fs.unlink(req.file.path, () => {});
      return res.json({ url: uploaded.secure_url });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Cloudinary upload failed.' });
    }
  }

  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.json({ url: publicUrl });
});

app.use((error, _req, res, _next) => {
  res.status(500).json({ error: error.message || 'Server error' });
});

await store.init();

app.listen(PORT, HOST, () => {
  console.log(`P's Online Mall API listening on ${HOST}:${PORT}`);
});
