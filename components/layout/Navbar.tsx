'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react'; // <-- NextAuth imports
import { Menu, Search, BookmarkPlus, ChevronDown, X, Film, Tv, Users, Calendar, Ticket, LogOut, PlayCircle, Sparkles, Trophy } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  // Grab the active user session
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212] text-white h-16 flex items-center shadow-md">
      <div className="max-w-[1400px] mx-auto w-full px-4 flex items-center gap-2 md:gap-4 relative">
        
        {/* 1. Logo */}
        <Link href="/" className="bg-[#f5c518] text-black font-extrabold px-2 py-1 rounded text-xl md:text-2xl tracking-tighter z-50">
          MovieHub
        </Link>

        {/* 2. Menu Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 hover:bg-white/10 px-3 py-2 rounded-md font-semibold text-sm transition-colors z-50 relative"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="hidden md:block">Menu</span>
          </button>

          {/* The IMDb-Style Mega Menu Dropdown */}
          {/* THE MEGA MENU DROPDOWN */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-4 w-[280px] sm:w-[500px] md:w-[700px] lg:w-[900px] bg-[#1f1f1f] border border-gray-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* 1. Movies Column */}
                <div>
                  <h3 className="text-[#f5c518] font-bold text-xl mb-4 flex items-center gap-2">
                    <Film className="w-6 h-6" /> Movies
                  </h3>
                  <ul className="space-y-3 text-gray-300 font-semibold text-sm">
                    <li><Link href="/browse/upcoming" className="hover:text-white hover:underline transition-all">Release Calendar</Link></li>
                    <li><Link href="/browse/top-250" className="hover:text-white hover:underline transition-all">Top 250 Movies</Link></li>
                    <li><Link href="/browse/popular" className="hover:text-white hover:underline transition-all">Most Popular Movies</Link></li>
                    <li><Link href="/coming-soon" className="hover:text-white hover:underline transition-all">Browse Movies by Genre</Link></li>
                    <li><Link href="/browse/trending" className="hover:text-white hover:underline transition-all">Top Box Office</Link></li>
                  </ul>
                </div>

                {/* 2. TV Shows Column */}
                <div>
                  <h3 className="text-[#f5c518] font-bold text-xl mb-4 flex items-center gap-2">
                    <Tv className="w-6 h-6" /> TV Shows
                  </h3>
                  <ul className="space-y-3 text-gray-300 font-semibold text-sm">
                    <li><Link href="/coming-soon" className="hover:text-white hover:underline transition-all">What's on TV & Streaming</Link></li>
                    <li><Link href="/coming-soon" className="hover:text-white hover:underline transition-all">Top 250 TV Shows</Link></li>
                    <li><Link href="/coming-soon" className="hover:text-white hover:underline transition-all">Most Popular TV Shows</Link></li>
                    <li><Link href="/coming-soon" className="hover:text-white hover:underline transition-all">Browse TV Shows by Genre</Link></li>
                  </ul>
                </div>

                {/* 3. Watch Column */}
                <div>
                  <h3 className="text-[#f5c518] font-bold text-xl mb-4 flex items-center gap-2">
                    <PlayCircle className="w-6 h-6" /> Watch
                  </h3>
                  <ul className="space-y-3 text-gray-300 font-semibold text-sm">
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">What to Watch</Link></li>
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">Latest Trailers</Link></li>
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">MovieHub Originals</Link></li>
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">MovieHub Picks</Link></li>
                  </ul>
                </div>

                {/* 4. Awards & Events Column */}
                <div>
                  <h3 className="text-[#f5c518] font-bold text-xl mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6" /> Awards & Events
                  </h3>
                  <ul className="space-y-3 text-gray-300 font-semibold text-sm">
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">Oscars</Link></li>
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">Emmys</Link></li>
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">STARmeter Awards</Link></li>
                    <li><Link href="#" className="hover:text-white hover:underline transition-all">All Events</Link></li>
                  </ul>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* 3. Search Bar Form */}
        <form onSubmit={handleSearch} className="flex-grow flex items-center bg-white rounded-md overflow-hidden h-9 mx-2">
          <button type="button" className="bg-gray-100 hover:bg-gray-200 text-black px-3 py-2 text-sm font-semibold border-r border-gray-300 hidden md:flex items-center gap-1 transition-colors">
            All <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MovieHub" 
            className="flex-grow text-black px-3 outline-none text-sm w-full" 
          />
          <button type="submit" className="px-3 text-gray-500 hover:text-black transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* 4. Right Side Actions (Authentication) */}
        <div className="flex items-center gap-1 md:gap-3 text-sm font-semibold">
          
          <Link href="/watchlist" className="flex items-center gap-1 hover:bg-white/10 px-3 py-2 rounded-md transition-colors">
            <BookmarkPlus className="w-5 h-5" />
            <span className="hidden lg:block">Watchlist</span>
          </Link>
          
          {/* DYNAMIC AUTHENTICATION UI */}
          {session ? (
            // IF LOGGED IN: Show Profile Picture & Logout Button
            <div className="flex items-center gap-3">
              <img 
                src={session.user?.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-600"
              />
              <button 
                onClick={() => signOut()}
                className="hidden md:flex items-center gap-1 hover:bg-red-500/10 text-red-400 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            // IF LOGGED OUT: Show Sign In Button
            <button 
              onClick={() => signIn('google')}
              className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}
          <Link href="/tickets" className="hover:text-[#f5c518] transition-colors font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5" /> My Tickets
          </Link>

          <Link href="/ai-recommend" className="text-purple-400 hover:text-purple-300 transition-colors font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Matchmaker
          </Link>
        </div>

      </div>
    </nav>
  );
}