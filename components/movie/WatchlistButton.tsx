'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';

export default function WatchlistButton({ movieId }: { movieId: string }) {
  const { data: session } = useSession();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWatchlist = async () => {
    // 1. Force the user to log in if they aren't already
    if (!session?.user?.email) {
      signIn('google');
      return;
    }

    // 2. Trigger loading state
    setIsLoading(true);

    try {
      // 3. Send the request to our new API route
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          movieId: movieId,
          email: session.user.email 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // 4. Update the button's UI state (Green Checkmark vs Plus icon)
        setIsWatchlisted(data.isWatchlisted);
      }
    } catch (error) {
      console.error('Failed to update watchlist', error);
    } finally {
      setIsLoading(false);
    }
  };

  // The Dynamic UI
  return (
    <button
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={`flex items-center gap-2.5 font-extrabold px-6 py-3.5 rounded-lg transition-colors shadow-lg ${
        isWatchlisted 
          ? 'bg-gray-800 text-[#f5c518] border border-[#f5c518]/50 hover:bg-gray-700' 
          : 'bg-[#f5c518] text-black hover:bg-yellow-500'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isWatchlisted ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <BookmarkPlus className="w-5 h-5" />
      )}
      
      {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
}