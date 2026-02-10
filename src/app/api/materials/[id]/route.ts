import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const material = await prisma.material.findUnique({
            where: { id },
            include: { reservations: { include: { user: true }, orderBy: { startDate: 'desc' } } },
        })
        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 })
        }
        return NextResponse.json(material)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 })
    }
}

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

        const material = await prisma.material.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                serialNumber: body.serialNumber || null,
                location: body.location,
                category: body.category,
                status: body.status,
                budget: body.budget || null,
                imageUrl: body.imageUrl || null,
                components: body.components || [], // Assumes JSON array
            },
        })
        return NextResponse.json(material)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update material' }, { status: 500 })
    }
}

export async function DELETE(
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
        await prisma.material.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
    }
}
