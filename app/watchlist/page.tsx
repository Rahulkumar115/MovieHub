import RemoveFromWatchlistButton from '@/components/movie/RemoveFromWatchlistButton'; // <-- Add this import
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getMovieDetails } from '@/lib/tmdb';
import MovieCard from '@/components/movie/MovieCard';
import Link from 'next/link';
import { BookmarkPlus } from 'lucide-react';

const prisma = new PrismaClient();

export default async function WatchlistPage() {
  // 1. Get the currently logged-in user
  const session = await getServerSession(authOptions);

  // 2. If they are not logged in, show a locked screen
  if (!session?.user?.email) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center pt-16">
        <BookmarkPlus className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Your Watchlist is Locked</h1>
        <p className="text-gray-400 mb-6">Please sign in to view and manage your saved movies.</p>
        <Link href="/" className="bg-[#f5c518] hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg transition">
          Go Home
        </Link>
      </main>
    );
  }

  // 3. Find the user in MongoDB to get their saved IDs
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  const watchlistIds = user?.watchlistIds || [];

  // 4. Fetch the full movie data from TMDB for every ID
  // We use Promise.all to fetch them all at the exact same time for maximum speed!
  const movies = await Promise.all(
    watchlistIds.map((id: string) => getMovieDetails(id))
  );

  // Remove any nulls just in case a movie was deleted from the TMDB database
  const validMovies = movies.filter((movie) => movie !== null);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-800 pb-6">
          <div className="w-1.5 h-8 bg-[#f5c518] rounded-full"></div>
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <span className="bg-gray-800 text-gray-300 py-1 px-3 rounded-full text-sm font-semibold ml-2">
            {validMovies.length} Movies
          </span>
        </div>

        {/* 5. Handle Empty State vs Grid State */}
        {validMovies.length === 0 ? (
          <div className="text-center mt-12 bg-[#1f1f1f] border border-gray-800 rounded-2xl p-12 max-w-2xl mx-auto shadow-xl">
            <BookmarkPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-8">Explore trending movies and add them to your list so you never forget what to watch next!</p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {validMovies.map((movie: any) => (
              <div key={movie.id} className="flex flex-col">
                <MovieCard movie={movie} />
                <RemoveFromWatchlistButton movieId={movie.id.toString()} />
              </div>
            ))}
          </div>
        )}
        
      </div>
    </main>
  );
}