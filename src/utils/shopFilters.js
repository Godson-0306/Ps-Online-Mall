export function matchesSearch(product, query) {
  if (!query) {
    return true;
  }

  const haystack = [product.name, product.brand, product.category, product.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function matchesCollection(product, collection) {
  if (!collection) {
    return true;
  }
  if (collection === 'new-arrivals') {
    return Boolean(product.isNew);
  }
  if (collection === 'deals') {
    return Number(product.discount) > 0;
  }
  if (collection === 'accessories') {
    return ['Accessories', 'Bags'].includes(product.category);
  }
  if (collection === 'tech') {
    return product.category === 'Electronics';
  }
  return true;
}

export function matchesCategoryParam(product, category) {
  if (!category) {
    return true;
  }
  const slug = String(product.category || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  return slug === category.toLowerCase() || String(product.id || '').toLowerCase() === category.toLowerCase();
}

export function matchesBrandParam(product, brand) {
  if (!brand) {
    return true;
  }
  return String(product.brand || '').toLowerCase() === brand.toLowerCase();
}
