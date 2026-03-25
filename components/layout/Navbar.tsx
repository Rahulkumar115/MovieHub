'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react'; // <-- NextAuth imports
import { Menu, Search, BookmarkPlus, ChevronDown, X, Film, Tv, Users, Calendar, LogOut } from 'lucide-react';

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
          {isMenuOpen && (
            <div className="absolute top-14 left-0 w-[300px] md:w-[600px] bg-[#1f1f1f] border border-gray-700 rounded-lg shadow-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 z-40">
              <div>
                <h3 className="text-[#f5c518] font-bold text-lg mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5" /> Movies
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="hover:text-white cursor-pointer transition">Release Calendar</li>
                  <li className="hover:text-white cursor-pointer transition">Top 250 Movies</li>
                </ul>
              </div>
              {/* Add more categories here if needed */}
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

          <button className="hidden md:flex items-center gap-1 hover:bg-white/10 px-3 py-2 rounded-md transition-colors">
            EN <ChevronDown className="w-4 h-4" />
          </button>
        </div>

      </div>
    </nav>
  );
}