import Link from 'next/link';
import { Star } from 'lucide-react';

// We define a quick TypeScript interface for the TMDB movie data
interface MovieProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
  };
}

export default function MovieCard({ movie }: MovieProps) {
  // TMDB only sends the image path (e.g., "/dune.jpg"), so we prepend their base URL
  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <Link href={`/movie/${movie.id}`} className="group relative block overflow-hidden rounded-xl transition-transform hover:scale-105">
      {/* The Poster Image */}
      <img 
        src={imageUrl} 
        alt={movie.title} 
        className="h-[400px] w-full object-cover bg-gray-800" 
      />
      
      {/* The Hover Overlay (Dark gradient that reveals the title) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute bottom-0 p-4 w-full">
          <h3 className="text-lg font-bold text-white truncate">{movie.title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{movie.vote_average?.toFixed(1)}</span>
            <span>•</span>
            {/* Extract just the year from "2024-03-01" */}
            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}