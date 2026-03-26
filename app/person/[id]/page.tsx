import { getPersonDetails } from '@/lib/tmdb';
import RecommendedMovieCard from '@/components/movie/RecommendedMovieCard';
import { User, Calendar, MapPin, Film, Info } from 'lucide-react';

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const person = await getPersonDetails(resolvedParams.id);

  if (!person) {
    return <div className="text-white text-center mt-20">Actor not found</div>;
  }

  const knownFor = person.movie_credits?.cast
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 15) || [];

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Header is now at the very top for everyone */}
        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
            {person.name}
          </h1>
        </div>

        {/* 2. Simple Flexbox Layout (Side-by-Side on Desktop, Stacked on Mobile) */}
        <div className="flex flex-col md:flex-row gap-10 items-start mb-16">
          
          {/* LEFT: STRICTLY SIZED IMAGE & INFO */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* The Image (Forced to be small and manageable) */}
            <img
              src={person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
              alt={person.name}
              className="w-full rounded-xl shadow-lg border border-gray-800 mb-6"
            />
            
            {/* Personal Info underneath the image */}
            <div className="space-y-4 text-sm bg-[#1f1f1f] p-5 rounded-xl border border-gray-800">
              <h3 className="font-bold text-white border-b border-gray-700 pb-2 mb-3">Personal Info</h3>
              
              <div>
                <p className="font-bold text-white">Known For</p>
                <p className="text-gray-400">{person.known_for_department}</p>
              </div>
              <div>
                <p className="font-bold text-white">Gender</p>
                <p className="text-gray-400">{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Other'}</p>
              </div>
              {person.birthday && (
                <div>
                  <p className="font-bold text-white">Birthday</p>
                  <p className="text-gray-400">{new Date(person.birthday).toLocaleDateString()}</p>
                </div>
              )}
              {person.place_of_birth && (
                <div>
                  <p className="font-bold text-white">Place of Birth</p>
                  <p className="text-gray-400">{person.place_of_birth}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: BIOGRAPHY */}
          <div className="flex-grow">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> Biography
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {person.biography || `We don't have a biography for ${person.name}.`}
            </p>
          </div>
        </div>

        {/* 3. KNOWN FOR GRID (Spans the full width at the bottom) */}
        <section className="pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> Known For
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {knownFor.map((movie: any) => (
              <RecommendedMovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}