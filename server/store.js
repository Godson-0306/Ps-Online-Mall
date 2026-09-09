const impl = process.env.DATABASE_URL
  ? await import('./pg-store.js')
  : await import('./memory-store.js');

export const init = impl.init;
export const getBanners = impl.getBanners;
export const getCategories = impl.getCategories;
export const getBrands = impl.getBrands;
export const getProducts = impl.getProducts;
export const getFeaturedProducts = impl.getFeaturedProducts;
export const getProduct = impl.getProduct;
export const createUser = impl.createUser;
export const findUserByEmail = impl.findUserByEmail;
export const findUserById = impl.findUserById;
export const updateUserPassword = impl.updateUserPassword;
export const createResetToken = impl.createResetToken;
export const consumeResetToken = impl.consumeResetToken;
export const saveNewsletter = impl.saveNewsletter;
export const saveContact = impl.saveContact;
export const validateCoupon = impl.validateCoupon;
export const listCoupons = impl.listCoupons;
export const saveCoupon = impl.saveCoupon;
export const deleteCoupon = impl.deleteCoupon;
export const createOrder = impl.createOrder;
export const getOrder = impl.getOrder;
export const listOrders = impl.listOrders;
export const listOrdersForUser = impl.listOrdersForUser;
export const updateOrder = impl.updateOrder;
export const createProduct = impl.createProduct;
export const updateProduct = impl.updateProduct;
export const deleteProduct = impl.deleteProduct;
export const stats = impl.stats;
