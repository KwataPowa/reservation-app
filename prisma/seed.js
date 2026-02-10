require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    const filePath = path.resolve(__dirname, '../Materiel.md')

    if (!fs.existsSync(filePath)) {
        console.log('Materiel.md not found at', filePath)
        return
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    let currentCategory = 'Uncategorized'
    let currentItem = null
    const items = []

    console.log('Parsing Materiel.md...')

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().replace(/\\#/g, '#').replace(/\\\*/g, '*').replace(/\\-/g, '-')

        if (line.startsWith('## ') && !line.startsWith('### ')) {
            currentCategory = line.replace('## ', '').replace(/\*/g, '').trim()
        } else if (line.startsWith('### ')) {
            if (currentItem && currentItem.name) {
                items.push({ ...currentItem })
            }
            currentItem = {
                name: line.replace('### ', '').replace(/\*/g, '').replace(/–/g, '-').trim(),
                category: currentCategory,
                description: '',
                serialNumber: null,
                location: 'C120',
            }
        } else if (currentItem) {
            const cleanLine = line.replace(/\*\*/g, '').replace(/\\*/g, '')

            if (cleanLine.includes('Numéro de série') && cleanLine.includes(':')) {
                let sn = cleanLine.split(':').slice(1).join(':').trim()
                if (sn === '?' || sn.includes('?') || sn === '') {
                    currentItem.serialNumber = null
                } else {
                    currentItem.serialNumber = sn
                }
            } else if (cleanLine.includes('Emplacement') && cleanLine.includes(':')) {
                currentItem.location = cleanLine.split(':').slice(1).join(':').trim()
            } else if (
                cleanLine.length > 0 &&
                !cleanLine.startsWith('|') &&
                !cleanLine.startsWith('---') &&
                !cleanLine.startsWith('Contenu') &&
                !cleanLine.startsWith('Tableau') &&
                !cleanLine.startsWith('Budget') &&
                !cleanLine.startsWith('Adresse Bluetooth') &&
                !cleanLine.startsWith('Dernier inventaire') &&
                !cleanLine.startsWith('Une partie') &&
                !cleanLine.startsWith('Remarques')
            ) {
                if (currentItem.description) {
                    currentItem.description += ' ' + cleanLine
                } else {
                    currentItem.description = cleanLine
                }
            }
        }
    }

    if (currentItem && currentItem.name) {
        items.push({ ...currentItem })
    }

    console.log(`Found ${items.length} items to seed.`)

    for (const item of items) {
        if (!item || !item.name) continue
        try {
            const created = await prisma.material.create({
                data: {
                    name: item.name,
                    description: item.description || null,
                    serialNumber: item.serialNumber,
                    location: item.location,
                    category: item.category,
                    status: 'AVAILABLE',
                },
            })
            console.log(`  Created: ${created.name}`)
        } catch (e) {
            console.log(`  Skipped: ${item.name} (${e.message?.substring(0, 80)})`)
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
