import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: "rzp_test_RqBpTs0iYonPRv",
  key_secret: "iUx3bL4Zng7PHc8T4m1wYiMH",
});

// 1. GENERATE ORDER & CREATE 'PENDING' BOOKING
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

const { amount, movieId, seats, theaterName, startTime } = await req.json(); // <-- Add theaterName and startTime here

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
        // We do a simple check to see if this time slot exists
      } 
    });
    
    if (!showtime) {
      showtime = await prisma.showtime.create({
        data: {
          tmdbMovieId: Number(movieId),
          theaterId: theater.id,
          startTime: startTime ? new Date(startTime) : new Date(), // <-- Use the actual selected time!
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

// 2. CONFIRM BOOKING AFTER PAYMENT SUCCESS
export async function PUT(req: Request) {
  try {
    const { razorpayOrderId, razorpayPaymentId } = await req.json();

    const updatedBooking = await prisma.booking.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
  }
}