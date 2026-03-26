import RecentTracker from '@/components/movie/RecentTracker';
import { PrismaClient } from '@prisma/client';
import ReviewForm from '@/components/movie/ReviewForm';

const prisma = new PrismaClient();
import WatchlistButton from '@/components/movie/WatchlistButton';
import { getMovieDetails } from '@/lib/tmdb';
import Link from 'next/link';
import RecommendedMovieCard from '@/components/movie/RecommendedMovieCard';
import { 
  Star, BookmarkPlus, MapPin, Film, Clock, User, 
  MessageSquare, Plus, ExternalLink, ChevronRight, PlayCircle, Image as ImageIcon
} from 'lucide-react';

const REGION_CODE = 'IN'; 

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  if (!movie) {
    return <div className="text-white text-center mt-20">Movie not found</div>;
  }

  // 1. Trailer logic
  const trailer = movie.videos?.results?.find(
    (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
  );

  // 2. Booking logic 
  const releaseDate = new Date(movie.release_date);
  const today = new Date();
  const diffDays = (today.getTime() - releaseDate.getTime()) / (1000 * 3600 * 24);
  const isBookable = diffDays <= 60;

  // 3. Streaming Provider logic
  const regionData = movie['watch/providers']?.results?.[REGION_CODE];
  const streamingProvider = regionData?.flatrate?.[0]; 

  // 4. Cast and Creator logic 
  const director = movie.credits?.crew?.find((person: any) => person.job === 'Director');
  const stars = movie.credits?.cast?.slice(0, 3); 
  const topCast = movie.credits?.cast?.slice(0, 6); 

  // 5. Video count
  const videoCount = movie.videos?.results?.length || 0;
  const photoCount = movie.images?.backdrops?.length || 0;
  
  // Get up to 6 extra videos (excluding the main trailer) and 10 photos
  const extraVideos = movie.videos?.results?.filter((v: any) => v.key !== trailer?.key).slice(0, 6) || [];
  const photos = movie.images?.backdrops?.slice(0, 10) || [];
  const reviews = movie.reviews?.results?.slice(0, 6) || [];

  // Fetch TMDB reviews
  const tmdbReviews = movie.reviews?.results?.slice(0, 3) || []; 
  
  // Fetch LOCAL Community Reviews from MongoDB
  const localReviews = await prisma.review.findMany({
    where: { movieId: resolvedParams.id.toString() },
    include: { user: true }, // Include the user's name and picture!
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-16 pt-16 md:pt-20">
    <RecentTracker movie={movie} />
      
      {/* 1. HERO HEADER SECTION */}
      <div className="relative w-full h-[65vh] overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-10 flex gap-8 items-end">
          <div className="w-48 flex-shrink-0 hidden md:block">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="rounded-xl shadow-2xl border-4 border-gray-800"
            />
          </div>

          <div className="flex-grow flex flex-col md:flex-row justify-between items-end gap-6 md:gap-0">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-2 leading-tight tracking-tight text-white drop-shadow-lg">
                {movie.title}
              </h1 >
              <p className="text-xl md:text-2xl text-gray-300 font-medium drop-shadow-md">
                {new Date(movie.release_date).getFullYear()} • {movie.genres?.map((g: any) => g.name).join(', ')} • <span className="text-gray-400">{movie.runtime} min</span>
              </p>
              {movie.tagline && (
                <p className="text-lg text-gray-400 italic mt-3 drop-shadow-md">"{movie.tagline}"</p>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-right w-full md:w-auto md:bg-gray-900/40 md:p-4 md:rounded-xl md:backdrop-blur-sm">
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">IMDb Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-10 h-10 text-[#f5c518] fill-[#f5c518]" />
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-bold text-white">{movie.vote_average.toFixed(1)}<span className="text-3xl text-gray-500">/10</span></span>
                    <span className="text-sm text-gray-500">{new Date(movie.release_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE MULTI-COLUMN INTERACTIVE BODY */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-[1fr,minmax(280px,360px)] gap-12">
        
        {/* LEFT COLUMN: Trailer, Main Info, Cast, Recommender */}
        <div className="space-y-12">
          
          {/* TRAILER EMBED (Moved to the very top!) */}
          {trailer && (
            <div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-gray-800">
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

          {/* THE MAIN ACTION BAR */}
          <div className="bg-[#1f1f1f] p-6 rounded-2xl shadow-xl flex flex-wrap gap-4 justify-between items-center border border-gray-800">
            <div className="flex flex-wrap gap-4 items-center">
              <WatchlistButton movieId={movie.id.toString()} />
              
              {isBookable ? (
                <Link href={`/book/${movie.id}`} className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-lg transition-colors">
                  <Film className="w-5 h-5 inline mr-2 -mt-0.5"/>
                  Book Tickets Now
                </Link>
              ) : (
                <button disabled className="block text-center bg-gray-800 text-gray-500 font-bold py-3.5 px-6 rounded-lg cursor-not-allowed">
                  <Film className="w-5 h-5 inline mr-2 -mt-0.5"/>
                  Not in Theaters
                </button>
              )}
            </div>
            
            {streamingProvider && (
              <div className="flex items-center gap-3.5 bg-gray-900 px-5 py-3 rounded-lg border border-gray-700">
                <p className="text-sm font-semibold text-gray-400 uppercase">Streaming</p>
                <img 
                  src={`https://image.tmdb.org/t/p/original${streamingProvider.logo_path}`} 
                  alt={streamingProvider.provider_name}
                  className="w-10 h-10 rounded-md border border-gray-600"
                />
                <span className="text-white font-semibold text-sm">{streamingProvider.provider_name}</span>
                {/* Replace the old <Link> with this <a> tag */}
                    <a 
                    href={regionData?.link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold hover:text-blue-300"
                    >
                    <ExternalLink className="w-4 h-4" /> Go to site
                    </a>
              </div>
            )}
          </div>

          {/* OVERVIEW & KEY CREDS */}
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> Description
              </h2>
              <p className="text-gray-300 text-xl leading-relaxed">{movie.overview}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
              {director && (
                <div className="flex items-center gap-4">
                  <User className="w-10 h-10 text-[#f5c518]"/>
                  <div>
                    <p className="text-lg font-bold text-white">Director</p>
                    <p className="text-blue-400 text-lg">{director.name}</p>
                  </div>
                </div>
              )}
              {stars && stars.length > 0 && (
                <div className="flex items-center gap-4">
                  <User className="w-10 h-10 text-[#f5c518]"/>
                  <div>
                    <p className="text-lg font-bold text-white">Stars</p>
                    <p className="text-blue-400 text-lg">
                      {stars.map((star: any) => star.name).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* TOP CAST GRID */}
          {topCast && topCast.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> Top Cast
                </h2>
                  <Link href={`/movie/${resolvedParams.id}/cast`} className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold hover:text-blue-300">
                    See all <ChevronRight className="w-5 h-5" />
                  </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
                {topCast.map((actor: any) => (
                  <Link 
                    href={`/person/${actor.id}`} 
                    key={actor.id} 
                    className="bg-[#1f1f1f] p-4 rounded-xl flex items-center gap-4 border border-gray-800 hover:bg-gray-800 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <img 
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />
                    <div>
                      <p className="text-white font-semibold text-lg hover:text-[#f5c518] transition-colors">{actor.name}</p>
                      <p className="text-gray-400 text-sm">{actor.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* MEDIA GALLERY: VIDEOS */}
          {extraVideos.length > 0 && (
            <section className="pt-12 border-t border-gray-800 w-full overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> Videos 
                  <span className="text-gray-500 font-normal text-lg ml-2">{videoCount}</span>
                </h2>
              </div>
              {/* Horizontal Scroll Container */}
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {extraVideos.map((vid: any) => (
                  <div key={vid.id} className="min-w-[280px] md:min-w-[350px] aspect-video flex-shrink-0 snap-start rounded-xl overflow-hidden bg-black shadow-lg border border-gray-800">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${vid.key}`}
                      title={vid.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MEDIA GALLERY: PHOTOS */}
          {photos.length > 0 && (
            <section className="pt-8 w-full overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> Photos 
                  <span className="text-gray-500 font-normal text-lg ml-2">{photoCount}</span>
                </h2>
              </div>
              {/* Horizontal Scroll Container */}
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {photos.map((photo: any, index: number) => (
                  <div key={index} className="min-w-[280px] md:min-w-[350px] aspect-video flex-shrink-0 snap-start rounded-xl overflow-hidden bg-gray-900 shadow-lg border border-gray-800">
                    <img 
                      src={`https://image.tmdb.org/t/p/w780${photo.file_path}`} 
                      alt={`Backdrop ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MORE LIKE THIS */}
          {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
            <section className="pt-12 border-t border-gray-800">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> More Like This
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                {movie.recommendations.results.slice(0, 10).map((recommendation: any) => (
                  <RecommendedMovieCard key={recommendation.id} movie={recommendation} />
                ))}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: Official Media Links & User Reviews */}
        <div className="space-y-12">

          {/* QUICK MEDIA LINKS (Replicating IMDb's right sidebar) */}
          {/* <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition cursor-pointer shadow-lg">
                <PlayCircle className="w-10 h-10 text-gray-400" />
                <span className="text-white font-semibold">{videoCount} Videos</span>
             </div>
             <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition cursor-pointer shadow-lg">
                <ImageIcon className="w-10 h-10 text-gray-400" />
                <span className="text-white font-semibold">99+ Photos</span>
             </div>
          </div> */}
          
          {/* USER REVIEWS BLOCK */}
          <section className="bg-[#1f1f1f] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> User Reviews
            </h2>
            
            <div className="grid grid-cols-[1fr,minmax(120px,1fr)] gap-6 justify-between items-center mb-6">
                <div>
                    <Star className="w-14 h-14 text-[#f5c518] fill-[#f5c518] inline-block -mt-3"/>
                    <span className="text-6xl font-extrabold text-white ml-2">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-2xl text-gray-500 font-bold ml-1">/10</span>
                    <p className="text-sm text-gray-400 mt-2 font-semibold">126.3K ratings spotlight</p>
                </div>
                {/* Mocked Rating Distribution Chart */}
                <div className="space-y-1">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating, index) => {
                        const widthPercent = Math.max(100 - (index * 8), 5); 
                        return (
                            <div key={rating} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-3">{rating}</span>
                                <div className="h-1.5 grow bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${widthPercent}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {/* DYNAMIC REVIEWS LIST */}
            {reviews.length > 0 ? (
              <div className="pt-6 border-t border-gray-800 space-y-6">
                {reviews.map((review: any) => (
                  <div key={review.id} className="pb-6 border-b border-gray-800/50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold border border-gray-600">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-md font-bold text-white leading-none">{review.author}</h4>
                          <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {/* Show the user's specific star rating if they left one */}
                      {review.author_details?.rating && (
                        <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded text-sm font-bold text-white border border-gray-700">
                          <Star className="w-4 h-4 text-[#f5c518] fill-[#f5c518]"/> 
                          {review.author_details.rating}<span className="text-gray-500 font-normal">/10</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-4 italic">"{review.content}"</p>
                    <Link href={review.url} target="_blank" className="flex items-center gap-1 text-blue-400 text-sm font-semibold hover:text-blue-300 mt-3 transition-colors">
                      Read full review on TMDB <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-800 text-center">
                <p className="text-gray-500 italic">No user reviews available for this movie yet.</p>
              </div>
            )}
          </section>

          {/* COMMUNITY REVIEWS (YOUR DATABASE) */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#f5c518] rounded-sm"></div> MovieHub Community Reviews
            </h2>
            
            {/* The Form */}
            <ReviewForm movieId={resolvedParams.id} />

            {/* The Local Reviews List */}
            <div className="space-y-6">
              {localReviews.map((review: any) => (
                <div key={review.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={review.user.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                        alt="User Avatar" 
                        className="w-10 h-10 rounded-full border border-gray-600"
                      />
                      <div>
                        <h4 className="text-md font-bold text-white leading-none">{review.user.name || 'Anonymous'}</h4>
                        <span className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-black px-2 py-1 rounded text-sm font-bold text-white border border-gray-700">
                      <Star className="w-4 h-4 text-[#f5c518] fill-[#f5c518]"/> 
                      {review.rating}<span className="text-gray-500 font-normal">/10</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>
                </div>
              ))}
              {localReviews.length === 0 && (
                <p className="text-gray-500 italic text-center py-4">Be the first to review this movie!</p>
              )}
            </div>
          </section>

        </div>

      </div>
    </main>
  );
}