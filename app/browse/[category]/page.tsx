import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getTrendingMovies } from '@/lib/tmdb';
import MovieCard from '@/components/movie/MovieCard';
import { Film } from 'lucide-react';

export default async function BrowsePage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const { category } = resolvedParams;

  let movies: any[] = [];
  let pageTitle = "Browse Movies";
  let pageSubtitle = "Discover great films";

  // The Magic Switchboard: Decides what data to fetch based on the URL
  switch (category) {
    case 'top-250':
      movies = await getTopRatedMovies();
      pageTitle = "Top 250 Movies";
      pageSubtitle = "The highest rated movies of all time, according to reviewers.";
      break;
    case 'popular':
      movies = await getPopularMovies();
      pageTitle = "Most Popular Movies";
      pageSubtitle = "What everyone is talking about right now.";
      break;
    case 'upcoming':
      movies = await getUpcomingMovies();
      pageTitle = "Release Calendar";
      pageSubtitle = "Highly anticipated movies coming to theaters soon.";
      break;
    case 'trending':
      movies = await getTrendingMovies();
      pageTitle = "Trending Box Office";
      pageSubtitle = "The hottest movies at the box office this week.";
      break;
    default:
      return <div className="text-white text-center mt-32 text-2xl">Category not found!</div>;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 border-b border-gray-800 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-4 mb-3">
            <div className="w-2 h-10 bg-[#f5c518] rounded-sm"></div>
            {pageTitle}
          </h1>
          <p className="text-gray-400 text-lg ml-6">{pageSubtitle}</p>
        </div>

        {/* The Massive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

      </div>
    </main>
  );
}