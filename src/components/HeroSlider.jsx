import { Link } from 'react-router-dom';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Button from './Button.jsx';

export default function HeroSlider({ slides }) {
  return (
    <section aria-label="Featured campaigns" className="relative">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        loop
        autoplay={{ delay: 5200, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className="hero-swiper h-[300px] sm:h-[380px] md:h-[500px] xl:h-[620px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#eee8f4]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_28%,rgba(75,0,130,0.22),transparent_26%),radial-gradient(circle_at_78%_36%,rgba(212,175,55,0.24),transparent_22%),linear-gradient(135deg,#f8f9fa_0%,#ebe5f1_48%,#f5f0df_100%)]" />
              <div className="absolute left-[12%] top-[18%] hidden h-64 w-52 rotate-[-8deg] rounded-[2rem] bg-white/60 shadow-soft md:block" />
              <div className="absolute right-[15%] top-[22%] hidden h-72 w-56 rotate-[7deg] rounded-[2rem] bg-white/50 shadow-soft md:block" />
              <div className="absolute bottom-[18%] left-1/2 hidden h-44 w-72 -translate-x-1/2 rounded-full border border-white/70 bg-white/25 blur-sm md:block" />
              <img
                src={slide.image}
                alt={slide.alt || 'P’s Online Mall campaign'}
                loading={slide === slides[0] ? 'eager' : 'lazy'}
                className="relative z-10 h-full w-full object-contain"
              />
              <div className="absolute inset-0 z-20 bg-brand-ink/5" />
              <Button
                as={Link}
                to={slide.cta || '/shop'}
                variant="gold"
                className="absolute bottom-8 z-30 px-7 py-3.5 text-xs uppercase tracking-[0.16em] shadow-lift sm:bottom-10 sm:px-8 sm:py-4 sm:text-sm md:bottom-12"
              >
                Shop Now
              </Button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
