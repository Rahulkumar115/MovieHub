import Link from 'next/link';
import { Hammer } from 'lucide-react';

export default function ComingSoon() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <Hammer className="w-24 h-24 text-[#f5c518] mb-8 animate-bounce" />
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center tracking-tight">Under Construction</h1>
      <p className="text-xl text-gray-400 max-w-lg text-center mb-10 leading-relaxed">
        Our TV Show and Awards databases are currently being built! Check back soon for full coverage.
      </p>
      <Link href="/" className="bg-[#f5c518] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-colors">
        Return Home
      </Link>
    </main>
  );
}