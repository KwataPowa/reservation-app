import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'
import sharp from 'sharp'

const MAX_WIDTH = 800
const QUALITY = 80

export async function POST(request: Request) {
    const session = await auth()
    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.' }, { status: 400 })
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo).' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()

        // Resize and convert to WebP
        const optimized = await sharp(Buffer.from(arrayBuffer))
            .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toBuffer()

        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`

        const { data, error } = await supabase.storage
            .from('material-images')
            .upload(filename, optimized, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (error) {
            console.error('Supabase upload error:', error)
            return NextResponse.json({ error: 'Échec de l\'upload.' }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('material-images')
            .getPublicUrl(data.path)

        return NextResponse.json({ url: urlData.publicUrl })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'upload.' }, { status: 500 })
    }
}
