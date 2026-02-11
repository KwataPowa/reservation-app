import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// POST /api/reservations/[id]/return — Return a material
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { returnNote, returnHasIssue } = body

        // Find the reservation
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: { material: true },
        })

        if (!reservation) {
            return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
        }

        if (reservation.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Seules les réservations approuvées peuvent être rendues' }, { status: 400 })
        }

        // @ts-ignore
        const isAdmin = session.user.role === 'ADMIN'
        const isOwner = reservation.userId === session.user.id

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Non-admin users can only return if the reservation period has started
        if (!isAdmin) {
            const now = new Date()
            const startDate = new Date(reservation.startDate)
            if (now < startDate) {
                return NextResponse.json(
                    { error: 'Vous ne pouvez rendre le matériel qu\'après le début de la réservation' },
                    { status: 400 }
                )
            }
        }

        // Update the reservation to RETURNED
        const updatedReservation = await prisma.reservation.update({
            where: { id },
            data: {
                status: 'RETURNED',
                returnedAt: new Date(),
                returnNote: returnNote || null,
                returnHasIssue: returnHasIssue || false,
            },
        })

        // If there is an issue, append the note to the material description
        if (returnHasIssue && returnNote) {
            const dateStr = new Date().toLocaleDateString('fr-FR')
            const issueText = `\n⚠️ [${dateStr}] Problème signalé : ${returnNote}`
            const currentDescription = reservation.material.description || ''

            await prisma.material.update({
                where: { id: reservation.materialId },
                data: {
                    description: currentDescription + issueText,
                },
            })
        }

        return NextResponse.json(updatedReservation)
    } catch (error) {
        console.error('Error returning material:', error)
        return NextResponse.json({ error: 'Erreur lors du retour du matériel' }, { status: 500 })
    }
}
