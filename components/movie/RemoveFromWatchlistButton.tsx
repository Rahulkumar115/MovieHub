'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function RemoveFromWatchlistButton({ movieId }: { movieId: string }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setIsRemoving(true);
    
    // We call the exact same API route, which knows to toggle the movie OFF
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId }),
    });

    // Instantly refresh the page so the movie vanishes from the grid!
    router.refresh();
  };

  return (
    <button 
      onClick={handleRemove}
      disabled={isRemoving}
      className="mt-3 w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 hover:text-red-400 font-semibold py-2.5 rounded-lg transition-colors border border-red-900/30 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isRemoving ? 'Removing...' : 'Remove'}
    </button>
  );
}