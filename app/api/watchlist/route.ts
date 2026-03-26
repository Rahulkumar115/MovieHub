import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
// 1. IMPORT THE MAGIC CACHE CLEARER
import { revalidatePath } from 'next/cache'; 

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { movieId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isWatchlisted = user.watchlistIds.includes(movieId.toString());
    let updatedWatchlist = [];

    if (isWatchlisted) {
      updatedWatchlist = user.watchlistIds.filter((id: string) => id !== movieId.toString());
    } else {
      updatedWatchlist = [...user.watchlistIds, movieId.toString()];
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { watchlistIds: updatedWatchlist },
    });

    // 2. TELL NEXT.JS TO IMMEDIATELY REFRESH THE WATCHLIST PAGE CACHE!
    revalidatePath('/watchlist');

    return NextResponse.json({ success: true, watchlistIds: updatedWatchlist }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// (Keep your existing GET function down here exactly as it was)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ watchlistIds: [] });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { watchlistIds: true }
    });

    return NextResponse.json({ watchlistIds: user?.watchlistIds || [] });
  } catch (error) {
    return NextResponse.json({ watchlistIds: [] });
  }
}