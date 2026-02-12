import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getAdminEmails } from '@/lib/dal';
import { sendReservationCancelledEmail } from '@/lib/email';

// POST /api/reservations/[id]/cancel — Cancel a reservation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { material: true, user: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // @ts-ignore
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = reservation.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only PENDING or APPROVED reservations can be cancelled
    if (!['PENDING', 'APPROVED'].includes(reservation.status)) {
      return NextResponse.json(
        { error: 'Seules les réservations en attente ou approuvées peuvent être annulées' },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { material: true, user: true },
    });

    // Await email sending — required for Vercel serverless
    const adminEmails = await getAdminEmails();
    await sendReservationCancelledEmail(adminEmails, {
      materialName: updatedReservation.material.name,
      userName: updatedReservation.user.name || 'Utilisateur',
      userEmail: updatedReservation.user.email,
      startDate: updatedReservation.startDate.toISOString(),
      endDate: updatedReservation.endDate.toISOString(),
      purpose: updatedReservation.purpose,
      location: updatedReservation.location,
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'annulation' }, { status: 500 });
  }
}
