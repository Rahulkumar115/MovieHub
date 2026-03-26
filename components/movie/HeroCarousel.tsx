'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel({ movies }: { movies: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll logic (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  // Manual Navigation Functions
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  if (!movies || movies.length === 0) return null;

  return (
    // 'group' allows us to hide arrows until the user hovers over the carousel
    <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden group">
      
      {/* 1. THE MOVIE SLIDES */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Main Backdrop Image */}
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
          />
          
          {/* Gradients to seamlessly blend the image into the dark page background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

          {/* Text Content */}
          <div className="absolute bottom-[15%] left-6 md:left-16 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
              {movie.title || movie.name}
            </h1>
            <p className="text-gray-300 text-lg mb-8 line-clamp-3 drop-shadow-md">
              {movie.overview}
            </p>
            <Link
              href={`/movie/${movie.id}`}
              className="bg-[#f5c518] hover:bg-yellow-500 text-black font-extrabold py-3.5 px-8 rounded-lg transition-colors inline-block"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}

      {/* 2. THE NAVIGATION ARROWS */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-600 backdrop-blur-md"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-600 backdrop-blur-md"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* 3. THE BOTTOM DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-[#f5c518] w-8' : 'bg-gray-500/80 hover:bg-gray-300 w-2.5'
            }`}
          />
        ))}
      </div>

    </div>
  );
}