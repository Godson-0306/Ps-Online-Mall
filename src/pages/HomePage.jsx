import { useQuery } from '@tanstack/react-query';
import Benefits from '../components/Benefits.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import FeaturedProducts from '../components/FeaturedProducts.jsx';
import FlashSale from '../components/FlashSale.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import Newsletter from '../components/Newsletter.jsx';
import PageMeta from '../components/PageMeta.jsx';
import TopBrands from '../components/TopBrands.jsx';
import { getBrands, getCategories, getFeaturedProducts, getHeroSlides } from '../services/api.js';
import { enrichProducts } from '../utils/enrichProducts.js';

export default function HomePage() {
  const heroQuery = useQuery({ queryKey: ['hero-slides'], queryFn: getHeroSlides });
  const categoryQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const productQuery = useQuery({ queryKey: ['featured-products'], queryFn: getFeaturedProducts });
  const brandQuery = useQuery({ queryKey: ['brands'], queryFn: getBrands });

  const loading =
    heroQuery.isLoading ||
    categoryQuery.isLoading ||
    productQuery.isLoading ||
    brandQuery.isLoading;

  if (loading) {
    return <LoadingSkeleton />;
  }

  const products = enrichProducts(productQuery.data || []);
  const flashSaleProducts = products.filter((product) => product.isFlashSale || product.discount);
  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 8);

  return (
    <>
      <PageMeta title="Home" />
      <HeroSlider slides={heroQuery.data || []} />
      <CategoryGrid categories={categoryQuery.data || []} />
      <FlashSale products={flashSaleProducts} />
      <FeaturedProducts products={featuredProducts} />
      <Benefits />
      <TopBrands brands={brandQuery.data || []} />
      <Newsletter />
    </>
  );
}
