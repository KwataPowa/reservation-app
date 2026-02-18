import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const materials = await prisma.material.findMany({
            orderBy: { category: 'asc' },
        })
        return NextResponse.json(materials)
    } catch (error) {
        console.error('Error fetching materials:', error)
        return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const material = await prisma.material.create({
            data: {
                name: body.name,
                description: body.description,
                serialNumber: body.serialNumber || null,
                location: body.location,
                category: body.category,
                status: body.status || 'AVAILABLE',
                budget: body.budget || null,
                imageUrl: body.imageUrl || null,
                notes: body.notes || null,
                components: body.components || [],
                badgeColor: body.badgeColor || null,
                badgeNumber: body.badgeNumber ? parseInt(body.badgeNumber) : null,
            },
        })
        return NextResponse.json(material, { status: 201 })
    } catch (error) {
        console.error('Error creating material:', error)
        return NextResponse.json({ error: 'Failed to create material' }, { status: 500 })
    }
}
