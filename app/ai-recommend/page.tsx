'use client';

import { useState } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AIRecommendationPage() {
  const [prompt, setPrompt] = useState('');
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setMovies([]); // Clear old results

    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      // --- SPY #4: Checking what the browser actually receives! ---
      console.log("🌐 FRONTEND RECEIVED:", data);

      if (data.movies && data.movies.length > 0) {
        setMovies(data.movies);
      } else {
        alert("The AI returned data, but it was empty! Check your browser console.");
      }
      
    } catch (error) {
      console.error(error);
      alert("The AI is currently resting. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-32 pb-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-purple-900/30 rounded-full mb-6 border border-purple-500/30">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-[#f5c518]">
            AI Movie Matchmaker
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Describe your exact mood, aesthetic, or wild scenario, and our AI will find the perfect movies for you.
          </p>
        </div>

        {/* The Search Box */}
        <form onSubmit={handleMagicSearch} className="w-full max-w-3xl relative mb-16">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A visually stunning sci-fi movie about time travel..."
            className="w-full bg-[#1f1f1f] border-2 border-gray-800 text-white px-6 py-5 rounded-2xl outline-none focus:border-purple-500 transition-colors text-lg shadow-xl pr-36"
          />
          <button 
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 disabled:opacity-50 text-white font-bold px-6 rounded-xl transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Ask AI
          </button>
        </form>

        {/* The Results Grid */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-purple-400 animate-pulse mt-10">
            <Sparkles className="w-12 h-12 mb-4" />
            <p className="text-xl font-bold">Consulting the cinematic universe...</p>
          </div>
        )}

        {!isLoading && movies.length > 0 && (
          <div className="w-full">
            <h3 className="text-2xl font-bold mb-8 border-b border-gray-800 pb-4 text-[#f5c518]">Your Perfect Matches</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {movies.map((movie, index) => (
                <Link 
                  href={`/movie/${movie.id}`} 
                  key={`${movie.id}-${index}`} 
                  className="group relative rounded-xl overflow-hidden h-72 md:h-80 border border-gray-800 hover:border-purple-500 transition-all shadow-lg hover:scale-105 flex flex-col bg-gray-900"
                >
                  {movie.poster_path ? (
                     <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center p-4 text-gray-500">
                      {movie.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-white font-bold">{movie.title}</span>
                    <span className="text-[#f5c518] text-sm font-semibold">★ {movie.vote_average?.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}