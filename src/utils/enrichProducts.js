const productMeta = [
  {
    category: 'Clothes',
    brand: 'Maison PS',
    colors: ['Purple', 'Black'],
    sizes: ['S', 'M', 'L'],
    availability: 'In Stock',
    isNew: true,
    popularity: 98,
    sales: 420,
  },
  {
    category: 'Bags',
    brand: 'Velour',
    colors: ['Tan', 'Black'],
    sizes: ['One Size'],
    availability: 'In Stock',
    isNew: false,
    popularity: 92,
    sales: 360,
  },
  {
    category: 'Shoes',
    brand: 'Sable',
    colors: ['White', 'Gold'],
    sizes: ['39', '40', '41', '42'],
    availability: 'In Stock',
    isNew: true,
    popularity: 89,
    sales: 310,
  },
  {
    category: 'Perfumes',
    brand: 'Noir Haus',
    colors: ['Black'],
    sizes: ['50ml', '100ml'],
    availability: 'Low Stock',
    isNew: false,
    popularity: 95,
    sales: 390,
  },
  {
    category: 'Electronics',
    brand: 'LuxeLab',
    colors: ['Black', 'Silver'],
    sizes: ['One Size'],
    availability: 'In Stock',
    isNew: true,
    popularity: 91,
    sales: 288,
  },
  {
    category: 'Accessories',
    brand: 'Aurelia',
    colors: ['Gold'],
    sizes: ['One Size'],
    availability: 'In Stock',
    isNew: false,
    popularity: 87,
    sales: 244,
  },
  {
    category: 'Kitchen',
    brand: 'Maison PS',
    colors: ['White'],
    sizes: ['12 Piece'],
    availability: 'In Stock',
    isNew: false,
    popularity: 80,
    sales: 205,
  },
  {
    category: 'Beauty',
    brand: 'Aurelia',
    colors: ['Pink', 'Gold'],
    sizes: ['Full Kit'],
    availability: 'In Stock',
    isNew: true,
    popularity: 86,
    sales: 275,
  },
];

export function enrichProducts(products) {
  return products.map((product, index) => {
    const meta = productMeta[index % productMeta.length];
    return {
      ...meta,
      ...product,
      description:
        product.description ||
        'A refined everyday essential selected for quality, finish, and lasting appeal.',
      specifications: product.specifications?.length
        ? product.specifications
        : [
            'Premium finish',
            'Carefully sourced materials',
            'Gift-ready packaging',
            'Quality checked before dispatch',
          ],
      gallery: product.gallery?.length ? product.gallery : [product.image, product.image, product.image],
      colors: product.colors?.length ? product.colors : meta.colors,
      sizes: product.sizes?.length ? product.sizes : meta.sizes,
    };
  });
}

export function getCatalogFacets(products) {
  const enriched = enrichProducts(products);

  return {
    categories: [...new Set(enriched.map((product) => product.category))],
    brands: [...new Set(enriched.map((product) => product.brand))],
    colors: [...new Set(enriched.flatMap((product) => product.colors))],
    sizes: [...new Set(enriched.flatMap((product) => product.sizes))],
    availability: [...new Set(enriched.map((product) => product.availability))],
  };
}
