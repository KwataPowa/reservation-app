import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// Admin: Get all reservations
export async function GET() {
    const session = await auth()
    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const reservations = await prisma.reservation.findMany({
            include: { user: true, material: true },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(reservations)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }
}
