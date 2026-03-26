import { getMovieDetails } from '@/lib/tmdb';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function FullCastPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  if (!movie) {
    return <div className="text-white text-center mt-20">Movie not found</div>;
  }

  // Extract the full arrays directly from the TMDB data
  const cast = movie.credits?.cast || [];
  const crew = movie.credits?.crew || [];

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Back Button */}
        <Link href={`/movie/${movie.id}`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 font-semibold transition-colors bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-800 hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" /> Back to {movie.title}
        </Link>

        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-12 flex items-center gap-3">
          <div className="w-2 h-10 bg-[#f5c518] rounded-sm"></div>
          Full Cast & Crew
        </h1>

        {/* 1. THE FULL CAST GRID */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-200 border-b border-gray-800 pb-3">
            Cast <span className="text-gray-500 text-lg font-normal ml-2">{cast.length}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cast.map((actor: any) => (
              <Link
                href={`/person/${actor.id}`}
                key={`${actor.id}-${actor.character}`}
                className="bg-[#1f1f1f] p-4 rounded-xl flex items-center gap-4 border border-gray-800 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
              >
                <img
                  src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                  alt={actor.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-base hover:text-[#f5c518] transition-colors truncate">{actor.name}</p>
                  <p className="text-gray-400 text-sm truncate">{actor.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 2. THE FULL CREW GRID */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-gray-200 border-b border-gray-800 pb-3">
            Crew <span className="text-gray-500 text-lg font-normal ml-2">{crew.length}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {crew.map((member: any, index: number) => (
              <Link
                href={`/person/${member.id}`}
                key={`${member.id}-${index}`}
                className="bg-[#1f1f1f] p-4 rounded-xl flex items-center gap-4 border border-gray-800 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
              >
                 <img
                  src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-base hover:text-[#f5c518] transition-colors truncate">{member.name}</p>
                  <p className="text-gray-400 text-sm truncate">{member.job}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}