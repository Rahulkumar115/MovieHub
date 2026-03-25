import { searchMovies } from '@/lib/tmdb';
import MovieCard from '@/components/movie/MovieCard';

// Next.js 15 requires searchParams to be typed as a Promise
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  // 1. Await the params before using them!
  const resolvedParams = await searchParams;
  const query = resolvedParams.q;

  // 2. If the user just goes to /search without typing anything
  if (!query) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8 text-center">
        <h1 className="text-3xl font-bold mt-10">Please enter a movie name to search.</h1>
      </main>
    );
  }

  // 3. Fetch the results from TMDB
  const searchResults = await searchMovies(query);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* The Search Header */}
        <h1 className="text-3xl font-bold mb-8 mt-4">
          Search Results for <span className="text-[#f5c518]">"{query}"</span>
        </h1>

        {/* 4. Handle Empty Results */}
        {searchResults.length === 0 ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl text-gray-400">No movies found matching your search.</h2>
            <p className="text-gray-500 mt-2">Try checking for typos or using different keywords.</p>
          </div>
        ) : (
          /* 5. The Results Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {searchResults.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
        
      </div>
    </main>
  );
}