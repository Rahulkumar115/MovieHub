import CancelButton from '@/components/booking/CancelButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getMovieDetails } from '@/lib/tmdb';
import Link from 'next/link';
import { Calendar, Clock, MapPin, QrCode, Ticket as TicketIcon } from 'lucide-react';

const prisma = new PrismaClient();

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <TicketIcon className="w-20 h-20 text-gray-700 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Please Sign In</h2>
        <p className="text-gray-400">You need to be logged in to view your tickets.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  // 1. Fetch only CONFIRMED bookings, including the linked Showtime and Theater
  const bookings = await prisma.booking.findMany({
    where: { 
      userId: user?.id,
      status: 'CONFIRMED' 
    },
    include: {
      showtime: {
        include: { theater: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Fetch the movie details from TMDB for each booking to get the poster and title
  const ticketsWithMovies = await Promise.all(
    bookings.map(async (booking) => {
      const movieData = await getMovieDetails(booking.showtime.tmdbMovieId.toString());
      return { ...booking, movie: movieData };
    })
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-10 border-b border-gray-800 pb-6">
          <TicketIcon className="w-10 h-10 text-[#f5c518]" />
          <h1 className="text-4xl font-extrabold tracking-tight">My Tickets</h1>
        </div>

        {ticketsWithMovies.length === 0 ? (
          <div className="text-center py-20 bg-[#1f1f1f] rounded-2xl border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">No tickets yet!</h3>
            <p className="text-gray-400 mb-8">It looks like you haven't booked any movies.</p>
            <Link href="/" className="bg-[#f5c518] text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {ticketsWithMovies.map((ticket) => (
              
              /* THE DIGITAL TICKET UI */
              /* THE DIGITAL TICKET UI */
              <div key={ticket.id} className="flex flex-col md:flex-row bg-[#1f1f1f] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
                
                {/* The new Cancel Button! */}
                <CancelButton bookingId={ticket.id} />

                {/* Left Side: Movie Poster */}
                
                {/* Left Side: Movie Poster */}
                <div className="md:w-48 h-64 md:h-auto bg-gray-900 flex-shrink-0">
                  {ticket.movie?.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${ticket.movie.poster_path}`} 
                      alt="poster" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">No Image</div>
                  )}
                </div>

                {/* Middle: Details */}
                <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-dashed border-gray-700 relative">
                  {/* Decorative cutouts for the ticket look */}
                  <div className="hidden md:block absolute -top-4 -right-4 w-8 h-8 bg-gray-950 rounded-full border-b border-l border-gray-800"></div>
                  <div className="hidden md:block absolute -bottom-4 -right-4 w-8 h-8 bg-gray-950 rounded-full border-t border-l border-gray-800"></div>

                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                      {ticket.movie?.title || "Movie Title"}
                    </h2>
                    <span className="bg-green-900/30 text-green-500 border border-green-900/50 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                      Confirmed
                    </span>
                  </div>

                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#f5c518]" />
                      <span className="font-medium">{ticket.showtime.theater.name}, {ticket.showtime.theater.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#f5c518]" />
                      <span className="font-medium">{new Date(ticket.showtime.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#f5c518]" />
                      <span className="font-medium">{new Date(ticket.showtime.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Seats</p>
                      <p className="text-xl font-bold text-[#f5c518]">{ticket.seatIds.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                      <p className="text-xl font-bold text-white">₹{ticket.totalAmount}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: QR Code Stub */}
                <div className="w-full md:w-48 bg-[#1a1a1a] p-6 flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <QrCode className="w-24 h-24 text-black" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-gray-500 font-mono text-center break-all">
                    ID: {ticket.razorpayOrderId?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-[#f5c518] font-bold mt-4 uppercase tracking-widest text-center">
                    Show this at entry
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}