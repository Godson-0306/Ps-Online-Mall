import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { seedBanners, seedCategories, seedCoupons, seedProducts } from './seed-data.js';

const { Pool } = pg;
let pool;

function json(value) {
  return JSON.stringify(value ?? []);
}

function mapProduct(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    gallery: row.gallery || [row.image],
    price: Number(row.price),
    originalPrice: Number(row.original_price || 0),
    rating: Number(row.rating || 0),
    discount: Number(row.discount || 0),
    category: row.category,
    brand: row.brand,
    colors: row.colors || [],
    sizes: row.sizes || [],
    availability: row.availability,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    isFlashSale: row.is_flash_sale,
    popularity: Number(row.popularity || 0),
    sales: Number(row.sales || 0),
    specifications: row.specifications || [],
    stock: Number(row.stock || 0),
  };
}

function mapUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

function mapOrder(row, items = []) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    status: row.status,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total: Number(row.total),
    coupon: row.coupon_code,
    paystackReference: row.paystack_reference,
    createdAt: row.created_at,
    items,
  };
}

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function init() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      image TEXT NOT NULL,
      cta TEXT,
      alt TEXT,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      gallery JSONB,
      price INTEGER NOT NULL,
      original_price INTEGER DEFAULT 0,
      rating NUMERIC(3,2) DEFAULT 0,
      discount INTEGER DEFAULT 0,
      category TEXT,
      brand TEXT,
      colors JSONB,
      sizes JSONB,
      availability TEXT,
      is_new BOOLEAN DEFAULT FALSE,
      is_featured BOOLEAN DEFAULT FALSE,
      is_flash_sale BOOLEAN DEFAULT FALSE,
      popularity INTEGER DEFAULT 0,
      sales INTEGER DEFAULT 0,
      specifications JSONB,
      stock INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      percent INTEGER NOT NULL,
      active BOOLEAN DEFAULT TRUE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT,
      name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      status TEXT NOT NULL,
      subtotal INTEGER DEFAULT 0,
      shipping INTEGER DEFAULT 0,
      discount INTEGER DEFAULT 0,
      tax INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      coupon_code TEXT,
      paystack_reference TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT,
      name TEXT,
      image TEXT,
      quantity INTEGER,
      price INTEGER,
      color TEXT,
      size TEXT
    );
    CREATE TABLE IF NOT EXISTS newsletter (
      email TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const [{ count }] = await query('SELECT COUNT(*)::int AS count FROM products');
  if (!count) {
    for (const category of seedCategories) {
      await query('INSERT INTO categories (id, name, image) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [
        category.id,
        category.name,
        category.image,
      ]);
    }
    for (const [index, banner] of seedBanners.entries()) {
      await query(
        'INSERT INTO banners (id, image, cta, alt, sort_order) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [banner.id, banner.image, banner.cta, banner.alt, index],
      );
    }
    for (const product of seedProducts) {
      await query(
        `INSERT INTO products (
          id, name, description, image, gallery, price, original_price, rating, discount,
          category, brand, colors, sizes, availability, is_new, is_featured, is_flash_sale,
          popularity, sales, specifications, stock
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        ON CONFLICT DO NOTHING`,
        [
          product.id,
          product.name,
          product.description,
          product.image,
          json([product.image, product.image, product.image]),
          product.price,
          product.originalPrice || 0,
          product.rating,
          product.discount,
          product.category,
          product.brand,
          json(product.colors),
          json(product.sizes),
          product.availability,
          product.isNew,
          product.isFeatured,
          product.isFlashSale,
          product.popularity,
          product.sales,
          json(product.specifications),
          product.stock,
        ],
      );
    }
    for (const coupon of seedCoupons) {
      await query('INSERT INTO coupons (code, percent, active) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [
        coupon.code,
        coupon.percent,
        coupon.active,
      ]);
    }
  }

  const [{ count: userCount }] = await query('SELECT COUNT(*)::int AS count FROM users');
  if (!userCount) {
    await createUser({
      name: 'Mall Admin',
      email: 'admin@psonlinemall.com',
      passwordHash: bcrypt.hashSync('Admin1234!', 10),
      role: 'admin',
    });
    await createUser({
      name: 'Demo Shopper',
      email: 'demo@psonlinemall.com',
      passwordHash: bcrypt.hashSync('Demo1234!', 10),
      role: 'customer',
    });
  }
}

export async function getBanners() {
  return query('SELECT * FROM banners ORDER BY sort_order');
}

export async function getCategories() {
  return query('SELECT * FROM categories');
}

export async function getBrands() {
  const rows = await query('SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL');
  return rows.map((row) => row.brand);
}

export async function getProducts() {
  return (await query('SELECT * FROM products ORDER BY name')).map(mapProduct);
}

export async function getFeaturedProducts() {
  return (await query('SELECT * FROM products WHERE is_featured = TRUE')).map(mapProduct);
}

export async function getProduct(id) {
  const [row] = await query('SELECT * FROM products WHERE id = $1', [id]);
  return mapProduct(row);
}

export async function createUser({ name, email, passwordHash, role = 'customer' }) {
  const id = randomUUID();
  const [row] = await query(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, name, email.toLowerCase(), passwordHash, role],
  );
  return mapUser(row);
}

export async function findUserByEmail(email) {
  const [row] = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return mapUser(row);
}

export async function findUserById(id) {
  const [row] = await query('SELECT * FROM users WHERE id = $1', [id]);
  return mapUser(row);
}

export async function updateUserPassword(id, passwordHash) {
  const [row] = await query('UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING *', [
    id,
    passwordHash,
  ]);
  return mapUser(row);
}

export async function createResetToken(userId, token, expiresAt) {
  await query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
  await query('INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1,$2,$3)', [
    token,
    userId,
    expiresAt,
  ]);
}

export async function consumeResetToken(token) {
  const [row] = await query('SELECT * FROM password_resets WHERE token = $1', [token]);
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return null;
  }
  await query('DELETE FROM password_resets WHERE token = $1', [token]);
  return { token: row.token, userId: row.user_id, expiresAt: row.expires_at };
}

export async function saveNewsletter(email) {
  await query('INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT DO NOTHING', [email]);
  return { email };
}

export async function saveContact(payload) {
  await query('INSERT INTO contacts (id, name, email, message) VALUES ($1,$2,$3,$4)', [
    randomUUID(),
    payload.name,
    payload.email,
    payload.message,
  ]);
  return { ok: true };
}

export async function validateCoupon(code) {
  const [row] = await query('SELECT * FROM coupons WHERE code = $1 AND active = TRUE', [
    String(code || '').toUpperCase(),
  ]);
  return row || null;
}

export async function listCoupons() {
  return query('SELECT * FROM coupons ORDER BY code');
}

export async function saveCoupon(coupon) {
  const code = coupon.code.toUpperCase();
  const [row] = await query(
    `INSERT INTO coupons (code, percent, active) VALUES ($1,$2,$3)
     ON CONFLICT (code) DO UPDATE SET percent = EXCLUDED.percent, active = EXCLUDED.active
     RETURNING *`,
    [code, Number(coupon.percent), coupon.active !== false],
  );
  return row;
}

export async function deleteCoupon(code) {
  await query('DELETE FROM coupons WHERE code = $1', [code.toUpperCase()]);
}

export async function createOrder(order) {
  await query(
    `INSERT INTO orders (
      id, user_id, email, name, phone, address, city, state, status,
      subtotal, shipping, discount, tax, total, coupon_code, paystack_reference
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [
      order.id,
      order.userId || null,
      order.email,
      order.name,
      order.phone,
      order.address,
      order.city,
      order.state,
      order.status,
      order.subtotal,
      order.shipping,
      order.discount,
      order.tax,
      order.total,
      order.coupon || null,
      order.paystackReference || null,
    ],
  );
  for (const item of order.items || []) {
    await query(
      `INSERT INTO order_items (id, order_id, product_id, name, image, quantity, price, color, size)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        randomUUID(),
        order.id,
        item.productId,
        item.name,
        item.image,
        item.quantity,
        item.price,
        item.color,
        item.size,
      ],
    );
  }
  return getOrder(order.id);
}

async function orderItems(orderId) {
  return query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
}

export async function getOrder(id) {
  const [row] = await query(
    'SELECT * FROM orders WHERE id = $1 OR paystack_reference = $1',
    [id],
  );
  if (!row) {
    return null;
  }
  return mapOrder(row, await orderItems(row.id));
}

export async function listOrders({ all = false } = {}) {
  const rows = all
    ? await query('SELECT * FROM orders ORDER BY created_at DESC')
    : await query('SELECT * FROM orders ORDER BY created_at DESC');
  return Promise.all(rows.map(async (row) => mapOrder(row, await orderItems(row.id))));
}

export async function listOrdersForUser(userId, email) {
  const rows = await query(
    'SELECT * FROM orders WHERE user_id = $1 OR email = $2 ORDER BY created_at DESC',
    [userId, email],
  );
  return Promise.all(rows.map(async (row) => mapOrder(row, await orderItems(row.id))));
}

export async function updateOrder(id, fields) {
  const current = await getOrder(id);
  if (!current) {
    return null;
  }
  const next = { ...current, ...fields };
  await query(
    `UPDATE orders SET status = $2, paystack_reference = $3 WHERE id = $1`,
    [current.id, next.status, next.paystackReference || current.paystackReference],
  );
  return getOrder(current.id);
}

export async function createProduct(product) {
  const id = product.id || randomUUID();
  const [row] = await query(
    `INSERT INTO products (
      id, name, description, image, gallery, price, original_price, rating, discount,
      category, brand, colors, sizes, availability, is_new, is_featured, is_flash_sale,
      popularity, sales, specifications, stock
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
    RETURNING *`,
    [
      id,
      product.name,
      product.description,
      product.image,
      json(product.gallery || [product.image]),
      product.price,
      product.originalPrice || 0,
      product.rating || 4.8,
      product.discount || 0,
      product.category,
      product.brand,
      json(product.colors || []),
      json(product.sizes || []),
      product.availability || 'In Stock',
      Boolean(product.isNew),
      product.isFeatured !== false,
      Boolean(product.isFlashSale),
      product.popularity || 80,
      product.sales || 0,
      json(product.specifications || []),
      product.stock || 0,
    ],
  );
  return mapProduct(row);
}

export async function updateProduct(id, product) {
  const current = await getProduct(id);
  if (!current) {
    return null;
  }
  const next = { ...current, ...product, id };
  const [row] = await query(
    `UPDATE products SET
      name=$2, description=$3, image=$4, gallery=$5, price=$6, original_price=$7,
      discount=$8, category=$9, brand=$10, colors=$11, sizes=$12, availability=$13,
      is_new=$14, is_featured=$15, is_flash_sale=$16, stock=$17
     WHERE id=$1 RETURNING *`,
    [
      id,
      next.name,
      next.description,
      next.image,
      json(next.gallery || [next.image]),
      next.price,
      next.originalPrice || 0,
      next.discount || 0,
      next.category,
      next.brand,
      json(next.colors || []),
      json(next.sizes || []),
      next.availability || 'In Stock',
      Boolean(next.isNew),
      Boolean(next.isFeatured),
      Boolean(next.isFlashSale),
      next.stock || 0,
    ],
  );
  return mapProduct(row);
}

export async function deleteProduct(id) {
  await query('DELETE FROM products WHERE id = $1', [id]);
}

export async function stats() {
  const [products] = await query('SELECT COUNT(*)::int AS count FROM products');
  const [orders] = await query('SELECT COUNT(*)::int AS count FROM orders');
  const [customers] = await query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'`);
  const [revenue] = await query(
    `SELECT COALESCE(SUM(total),0)::int AS total FROM orders WHERE status IN ('paid','packed','shipped','delivered')`,
  );
  return {
    productCount: products.count,
    orderCount: orders.count,
    customerCount: customers.count,
    revenue: revenue.total,
  };
}
