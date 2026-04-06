import { getMovieDetails } from '@/lib/tmdb';
import SeatMatrix from '@/components/booking/SeatMatrix';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  if (!movie) {
    return <div className="text-white text-center mt-20">Movie not found</div>;
  }

  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href={`/movie/${movie.id}`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 font-semibold transition-colors bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-800">
            <ArrowLeft className="w-5 h-5" /> Back to Movie
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#f5c518] rounded-sm"></div>
            Book Tickets for {movie.title}
          </h1>
        </div>

        {/* The Interactive Seat Matrix */}
        <SeatMatrix movie={movie} />

      </div>
    </main>
  );
}