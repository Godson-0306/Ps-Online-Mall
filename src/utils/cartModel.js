export function calculateCartTotals(items, coupon = '') {
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal > 75000 || subtotal === 0 ? 0 : 6500;
  const couponDiscount = coupon.toUpperCase() === 'PSGOLD' ? subtotal * 0.1 : 0;
  const estimatedTax = subtotal * 0.075;
  const grandTotal = Math.max(0, subtotal + shipping + estimatedTax - couponDiscount);

  return {
    subtotal,
    shipping,
    discount: couponDiscount,
    estimatedTax,
    grandTotal,
  };
}
