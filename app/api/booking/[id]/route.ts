import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendTicketEmail } from '@/lib/email'; // <-- Import your new function!
import { getMovieDetails } from '@/lib/tmdb';

const prisma = new PrismaClient();

// DELETE a booking by its ID
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.booking.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: "Ticket cancelled" }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to cancel ticket' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { razorpayOrderId, razorpayPaymentId } = await req.json();

    // 1. Find the booking in the database
    const booking = await prisma.booking.findFirst({
      where: { razorpayOrderId: razorpayOrderId },
      include: { 
        user: true, 
        showtime: { include: { theater: true } } 
      }
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // 2. Update the booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        razorpayPaymentId: razorpayPaymentId,
      },
    });

    // 3. --- NEW: SEND THE EMAIL! ---
    if (booking.user?.email) {
      // Fetch the movie title from TMDB
      const movieData = await getMovieDetails(booking.showtime.tmdbMovieId.toString());
      const movieTitle = movieData?.title || "Your Movie";
      
      // Format the date
      const formattedTime = new Date(booking.showtime.startTime).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });

      // Fire off the email in the background!
      await sendTicketEmail(
        booking.user.email, // This must be the email you used to sign up for Resend during testing!
        movieTitle,
        booking.showtime.theater.name,
        formattedTime,
        booking.seatIds.join(', '),
        booking.totalAmount,
        razorpayOrderId
      );
    }
    // -------------------------------

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}