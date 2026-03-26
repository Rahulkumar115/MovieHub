'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function ReviewForm({ movieId }: { movieId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(10);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If not logged in, prompt them
  if (!session) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Have you seen this movie?</h3>
        <p className="text-gray-400 mb-4">Sign in with Google to leave your own review and rate it out of 10.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, rating, content }),
      });

      if (res.ok) {
        setContent('');
        setRating(10);
        router.refresh(); // Automatically reload the page to show the new review!
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Leave a Review</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-400 mb-2">Your Rating (out of 10)</label>
        <select 
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))}
          className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 outline-none focus:border-[#f5c518]"
        >
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
            <option key={num} value={num}>{num} / 10</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you think of the movie?"
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-4 py-3 h-28 outline-none focus:border-[#f5c518] resize-none"
          required
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-[#f5c518] hover:bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" /> {isSubmitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}