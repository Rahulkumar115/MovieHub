'use client'; // Tells Next.js to render this on the browser for interactivity

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Movie {
  id: number;
  title: string;
  backdrop_path: string;
  overview: string;
}

export default function HeroCarousel({ movies }: { movies: Movie[] }) {
  // We only want to show the top 5 movies in the slider, not all 20
  const topMovies = movies.slice(0, 5);

  return (
    <div className="w-full h-[60vh] sm:h-[70vh] relative mb-12">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {topMovies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="relative w-full h-full">
              {/* The Cinematic Backdrop Image */}
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              
              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/50 to-transparent" />

              {/* Text Content & Call to Action */}
              <div className="absolute bottom-[15%] left-[5%] md:left-[10%] max-w-2xl text-left">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                  {movie.title}
                </h1>
                <p className="text-gray-300 text-sm md:text-lg line-clamp-3 mb-6 drop-shadow-md">
                  {movie.overview}
                </p>
                
                <div className="flex gap-4">
                  <Link 
                    href={`/movie/${movie.id}`} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}