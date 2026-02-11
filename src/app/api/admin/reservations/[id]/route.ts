import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { sendReservationApprovedEmail, sendReservationRejectedEmail } from '@/lib/email'

// Admin: Approve or Reject a reservation
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { status } = body // APPROVED or REJECTED

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const reservation = await prisma.reservation.update({
            where: { id },
            data: { status },
            include: { user: true, material: true },
        })

        // Fire-and-forget: email user about status change
        const emailData = {
            materialName: reservation.material.name,
            userName: reservation.user.name || 'Utilisateur',
            userEmail: reservation.user.email,
            startDate: reservation.startDate.toISOString(),
            endDate: reservation.endDate.toISOString(),
            purpose: reservation.purpose,
            location: reservation.location,
        };

        if (status === 'APPROVED') {
            sendReservationApprovedEmail(reservation.user.email, emailData);
        } else if (status === 'REJECTED') {
            sendReservationRejectedEmail(reservation.user.email, emailData);
        }

        return NextResponse.json(reservation)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
    }
}
