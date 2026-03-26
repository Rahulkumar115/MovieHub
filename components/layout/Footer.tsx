'use client';

import { usePathname, useRouter } from 'next/navigation'; // <-- Add useRouter here
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BookmarkPlus, Check } from 'lucide-react';
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [recentMovies, setRecentMovies] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // 1. Load recent movies whenever the URL changes
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentMovies') || '[]');
    setRecentMovies(stored);
  }, [pathname]);

  // 2. Fetch the user's actual Watchlist from MongoDB
  useEffect(() => {
    if (session) {
      fetch('/api/watchlist')
        .then(res => res.json())
        .then(data => {
          if (data.watchlistIds) setWatchlist(data.watchlistIds);
        });
    }
  }, [session]);

  // 3. The "Clear All" Function
  const handleClearAll = () => {
    localStorage.removeItem('recentMovies');
    setRecentMovies([]); // Immediately updates the UI
  };

  // 4. The Bookmark Toggle Function
  const toggleBookmark = async (e: any, movieId: string) => {
    e.preventDefault(); // Stops the link from taking you to the movie page
    e.stopPropagation();
    
    if (!session) return alert("Please sign in to add movies to your watchlist!");

    // Instantly update the UI so the checkmark appears immediately (Optimistic UI)
    if (watchlist.includes(movieId)) {
      setWatchlist(watchlist.filter(id => id !== movieId));
    } else {
      setWatchlist([...watchlist, movieId]);
    }

    // Send the actual request to MongoDB in the background
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId })
    });
    router.refresh();
  };

  return (
    <footer className="bg-black border-t border-gray-800 text-white pt-12 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* RECENTLY VIEWED SECTION (Only shows if you actually have history!) */}
        {recentMovies.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-bold text-white tracking-wide">Recently viewed</h3>
              <button 
                onClick={handleClearAll} 
                className="text-blue-500 hover:text-blue-400 text-sm font-semibold transition-colors"
              >
                Clear all
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {recentMovies.map((item) => {
                const isAdded = watchlist.includes(item.id);

                return (
                  <Link href={`/movie/${item.id}`} key={item.id} className="min-w-[140px] w-[140px] group relative block">
                    {/* The Clickable Bookmark Icon */}
                    <div 
                      onClick={(e) => toggleBookmark(e, item.id)}
                      className="absolute top-0 left-0 z-10 opacity-90 cursor-pointer"
                    >
                      {isAdded ? (
                         <div className="bg-[#f5c518]/90 p-1 rounded-br-lg">
                            <Check className="w-6 h-6 text-black" />
                         </div>
                      ) : (
                        <div className="bg-black/60 p-1 rounded-br-lg hover:bg-black transition-colors">
                            <BookmarkPlus className="w-6 h-6 text-white hover:text-[#f5c518]" />
                        </div>
                      )}
                    </div>
                    
                    {/* Poster Image */}
                    <div className="aspect-[2/3] w-full bg-gray-900 rounded-md overflow-hidden mb-2">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-200 group-hover:underline truncate">{item.title}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* SOCIAL LINKS BLOCK */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 border border-gray-700 rounded-lg px-8 py-4">
            <span className="font-bold text-lg text-white">Follow MovieHub on social</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400 transition-colors"><FaInstagram className="w-6 h-6" /></a>
              <a href="#" className="hover:text-gray-400 transition-colors"><FaTwitter className="w-6 h-6" /></a>
              <a href="#" className="hover:text-gray-400 transition-colors"><FaYoutube className="w-6 h-6" /></a>
              <a href="#" className="hover:text-gray-400 transition-colors"><FaFacebook className="w-6 h-6" /></a>
            </div>
          </div>
        </div>

        {/* SITE INDEX LINKS */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-white mb-8 max-w-3xl mx-auto text-center">
          <Link href="#" className="hover:underline">Help</Link>
          <Link href="#" className="hover:underline">Site Index</Link>
          <Link href="#" className="hover:underline">MovieHubPro</Link>
          <Link href="#" className="hover:underline">Box Office Mojo</Link>
          <Link href="#" className="hover:underline">License Data</Link>
          <Link href="#" className="hover:underline">Press Room</Link>
          <Link href="#" className="hover:underline">Advertising</Link>
          <Link href="#" className="hover:underline">Jobs</Link>
          <Link href="#" className="hover:underline">Conditions of Use</Link>
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <Link href="#" className="hover:underline flex items-center gap-2">
            <div className="w-6 h-3 bg-blue-500 rounded-sm"></div> Your Ads Privacy Choices
          </Link>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center text-sm text-gray-400">
          <p>an <span className="font-bold text-white">oriental university</span> project</p>
          <p className="mt-2">© 1990-{new Date().getFullYear()} by MovieHub.com, Inc.</p>
        </div>

      </div>
    </footer>
  );
}