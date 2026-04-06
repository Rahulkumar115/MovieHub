import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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