'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = async () => {
    // 1. Ask for confirmation before deleting
    const confirmDelete = window.confirm("Are you sure you want to cancel this ticket? This cannot be undone.");
    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      // 2. Call our new DELETE API
      const res = await fetch(`/api/booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // 3. The Magic Trick: This tells Next.js to instantly refresh the server component!
        router.refresh(); 
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong cancelling your ticket.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isDeleting}
      className="absolute top-4 right-4 bg-red-900/30 text-red-500 hover:bg-red-600 hover:text-white p-2.5 rounded-full transition-all duration-300 disabled:opacity-50 z-10 shadow-sm border border-red-900/50"
      title="Cancel Ticket"
    >
      {isDeleting ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <Trash2 className="w-5 h-5" />
      )}
    </button>
  );
}