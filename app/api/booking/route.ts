import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import { sendTicketEmail } from '@/lib/email'; 
import { getMovieDetails } from '@/lib/tmdb'; 

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// 1. GENERATE ORDER & CREATE 'PENDING' BOOKING
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { amount, movieId, seats, theaterName, startTime } = await req.json();

    // Find or create the SPECIFIC theater the user picked
    let theater = await prisma.theater.findFirst({ where: { name: theaterName } });
    if (!theater) {
      theater = await prisma.theater.create({
        data: { name: theaterName || "MovieHub Grand Cinemas", location: "Indore" }
      });
    }

    // Find or create a showtime for this specific movie and time
    let showtime = await prisma.showtime.findFirst({ 
      where: { 
        tmdbMovieId: Number(movieId),
        theaterId: theater.id,
      } 
    });
    
    if (!showtime) {
      showtime = await prisma.showtime.create({
        data: {
          tmdbMovieId: Number(movieId),
          theaterId: theater.id,
          startTime: startTime ? new Date(startTime) : new Date(), 
          ticketPrice: 150,
        }
      });
    }

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Create PENDING Booking in database
    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        showtimeId: showtime.id,
        seatIds: seats,
        totalAmount: amount,
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ orderId: order.id, bookingId: newBooking.id }, { status: 200 });
  } catch (error) {
    console.error('Error initiating booking:', error);
    return NextResponse.json({ error: 'Failed to initiate booking' }, { status: 500 });
  }
}

// 2. CONFIRM BOOKING AFTER PAYMENT SUCCESS & SEND EMAIL
export async function PUT(req: Request) {
  try {
    const { razorpayOrderId, razorpayPaymentId } = await req.json();

    // 1. Find the booking FIRST so we can include the user's email and theater info
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

    // --- NEW SPIES TO CATCH THE BUG ---
    console.log("🎟️ Booking found:", booking.id);
    console.log("👤 User attached to booking:", booking.user?.name);
    console.log("📧 User Email:", booking.user?.email);
    // ----------------------------------

    // 3. SEND THE EMAIL
    if (booking.user?.email) {
      console.log("✅ Email exists! Triggering Resend...");
      
      const movieData = await getMovieDetails(booking.showtime.tmdbMovieId.toString());
      const movieTitle = movieData?.title || "Your Movie";
      
      const formattedTime = new Date(booking.showtime.startTime).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });

      await sendTicketEmail(
        booking.user.email, 
        movieTitle,
        booking.showtime.theater.name,
        formattedTime,
        booking.seatIds.join(', '),
        booking.totalAmount,
        razorpayOrderId
      );
    } else {
      console.log("❌ NO EMAIL FOUND FOR THIS USER! Skipping Resend.");
    }

    return NextResponse.json({ success: true, booking: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
  }
}