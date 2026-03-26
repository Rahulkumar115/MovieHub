import { getTrendingMovies, getNowPlayingMovies, getPopularMovies, getTopRatedMovies } from '@/lib/tmdb';
import HeroCarousel from '@/components/movie/HeroCarousel';
import MovieCard from '@/components/movie/MovieCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  // Fetch all categories simultaneously for maximum loading speed
  const [trending, inTheaters, popular, topRated] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(),
    getPopularMovies(),
    getTopRatedMovies()
  ]);

  // A helper component to render those classic IMDb horizontal scrolling rows
  const MovieRow = ({ title, subtitle, movies }: { title: string, subtitle?: string, movies: any[] }) => (
    <section className="mb-12">
      <div className="mb-6">
        <Link href="#" className="flex items-center gap-2 group cursor-pointer inline-flex">
          <div className="w-1.5 h-7 bg-[#f5c518] rounded-sm"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-[#f5c518] transition-colors flex items-center gap-1">
            {title} <ChevronRight className="w-6 h-6 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h2>
        </Link>
        {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x hide-scrollbar">
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[160px] md:min-w-[200px] snap-start flex-shrink-0">
            {/* Reusing your existing MovieCard component! */}
            <MovieCard movie={movie} /> 
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-gray-950">
      {/* HUGE FEATURED CAROUSEL AT THE TOP */}
      {trending.length > 0 && <HeroCarousel movies={trending.slice(0, 5)} />}

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 space-y-8">
        
        {/* ROW 1: IN THEATERS */}
        <MovieRow 
          title="In theaters" 
          subtitle="Showtimes near you" 
          movies={inTheaters} 
        />

        {/* ROW 2: TOP PICKS */}
        <MovieRow 
          title="Top picks" 
          subtitle="TV shows and movies just for you" 
          movies={topRated} 
        />

        {/* ROW 3: FAN FAVORITES */}
        <MovieRow 
          title="Fan favorites" 
          subtitle="This week's top TV and movies" 
          movies={popular} 
        />
        
        {/* ROW 4: TRENDING NOW */}
        <MovieRow 
          title="Trending now" 
          subtitle="What people are watching" 
          movies={trending} 
        />

      </div>
    </main>
  );
}