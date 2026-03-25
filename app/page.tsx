import { getTrendingMovies } from '@/lib/tmdb';
import MovieCard from '@/components/movie/MovieCard';
import HeroCarousel from '@/components/movie/HeroCarousel'; // <-- Import the new component

export default async function HomePage() {
  const trendingMovies = await getTrendingMovies();

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-12">
      
      {/* 1. The Hero Slider at the very top */}
      <HeroCarousel movies={trendingMovies} />

      {/* 2. The Movie Grid below it */}
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-blue-600 pl-3">
          Now Showing
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trendingMovies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
      
    </main>
  );
}