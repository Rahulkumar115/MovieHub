import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { movieId, rating, content } = body;

    // Find the logged-in user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Save the new review
    const newReview = await prisma.review.create({
      data: {
        movieId: movieId.toString(),
        rating: Number(rating),
        content,
        userId: user.id,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Failed to post review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}