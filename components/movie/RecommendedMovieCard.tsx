import Link from 'next/link';

interface RecommendedMovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
  };
}

export default function RecommendedMovieCard({ movie }: RecommendedMovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`} className="block group">
      <div className="aspect-[2/3] w-full rounded-md overflow-hidden bg-gray-800">
        <img 
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
          alt={movie.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <p className="text-sm font-semibold text-white mt-2 group-hover:text-[#f5c518] truncate transition-colors">
        {movie.title}
      </p>
    </Link>
  );
}