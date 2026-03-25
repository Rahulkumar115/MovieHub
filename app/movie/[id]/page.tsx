import { getMovieDetails } from '@/lib/tmdb';
import Link from 'next/link';

// Make sure 'export default' is right here!
export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, we have to await the URL parameters
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  // If the API fails or movie isn't found
  if (!movie) {
    return <div className="text-white text-center mt-20">Movie not found</div>;
  }

  // Find the official YouTube trailer
  const trailer = movie.videos?.results?.find(
    (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* 1. HUGE BACKDROP IMAGE */}
      <div className="relative w-full h-[60vh]">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
        
        {/* Title & Tagline overlay */}
        <div className="absolute bottom-10 left-10 max-w-4xl">
          <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
          <p className="text-xl text-gray-300 italic">{movie.tagline}</p>
        </div>
      </div>

      {/* 2. MOVIE DETAILS & TRAILER */}
      <div className="max-w-7xl mx-auto px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left Column: Info & Booking */}
        <div className="md:col-span-1 space-y-6">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="rounded-xl shadow-2xl"
          />
          
          <div className="flex justify-between text-gray-400 font-semibold">
            <span>{movie.release_date}</span>
            <span>⭐ {movie.vote_average?.toFixed(1)} / 10</span>
            <span>{movie.runtime} mins</span>
          </div>

          {/* This button will route to our SeatGrid page */}
          <Link href={`/book/${movie.id}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors">
            Book Tickets Now
          </Link>
        </div>

        {/* Right Column: Overview & Video */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
          </div>

          {/* YouTube Trailer Embed */}
          {trailer && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Official Trailer</h2>
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}