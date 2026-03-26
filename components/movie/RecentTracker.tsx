'use client';

import { useEffect } from 'react';

export default function RecentTracker({ movie }: { movie: any }) {
  useEffect(() => {
    if (!movie || !movie.id) return;

    // 1. Get the current history from local storage
    const stored = JSON.parse(localStorage.getItem('recentMovies') || '[]');
    
    // 2. Remove the movie if it's already in the list (so we don't get duplicates)
    const filtered = stored.filter((m: any) => m.id !== movie.id.toString());
    
    // 3. Add the movie to the very front, and keep only the last 10 movies
    const updated = [{
      id: movie.id.toString(),
      title: movie.title,
      image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    }, ...filtered].slice(0, 10);

    // 4. Save it back to storage!
    localStorage.setItem('recentMovies', JSON.stringify(updated));
  }, [movie]);

  return null; // This component is completely invisible!
}