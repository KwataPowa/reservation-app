import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminEmails } from '@/lib/dal'
import { sendReservationSubmittedEmail } from '@/lib/email'

export async function GET() {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const reservations = await prisma.reservation.findMany({
            where: { userId: session.user.id },
            include: { material: true },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(reservations)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        // Check if material is available for the requested dates
        const overlapping = await prisma.reservation.findFirst({
            where: {
                materialId: body.materialId,
                status: { in: ['PENDING', 'APPROVED'] },
                NOT: { status: 'CANCELLED' },
                OR: [
                    {
                        startDate: { lte: new Date(body.endDate) },
                        endDate: { gte: new Date(body.startDate) },
                    },
                ],
            },
        })

        if (overlapping) {
            return NextResponse.json(
                { error: 'Ce matériel est déjà réservé pour ces dates.' },
                { status: 409 }
            )
        }

        const status = session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

        const material = await prisma.material.findUnique({
            where: { id: body.materialId },
        })

        const reservation = await prisma.reservation.create({
            data: {
                userId: session.user.id!,
                materialId: body.materialId,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                purpose: body.purpose || null,
                location: body.location || null,
                status: status,
            },
        })

        // Await email sending — required for Vercel serverless
        if (material) {
            const adminEmails = await getAdminEmails();
            await sendReservationSubmittedEmail(adminEmails, {
                materialName: material.name,
                userName: session.user!.name || 'Utilisateur',
                userEmail: session.user!.email || '',
                startDate: body.startDate,
                endDate: body.endDate,
                purpose: body.purpose,
                location: body.location,
            });
        }

        return NextResponse.json(reservation, { status: 201 })
    } catch (error) {
        console.error('Error creating reservation:', error)
        return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
    }
}
