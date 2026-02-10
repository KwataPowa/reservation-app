import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

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
        return NextResponse.json(reservation)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
    }
}
