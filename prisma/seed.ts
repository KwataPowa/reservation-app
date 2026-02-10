import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. HTC Vive
    await prisma.material.create({
        data: {
            name: 'HTC Vive',
            description: 'Casque HTC Vive, modèle de base à utiliser avec 2 stations infrarouge et un boîtier de liaison.',
            category: 'Casques',
            location: 'C120',
            serialNumber: 'FA6BFAB01091',
            budget: 'IGG 2017 / UFR MI 2018',
            status: 'AVAILABLE',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/HTC_Vive_Headset_%282016%29.jpg/1200px-HTC_Vive_Headset_%282016%29.jpg', // Placeholder valid URL
            components: [
                { name: 'Casque', serialNumber: 'FA6BTJJ01323' },
                { name: 'Boîtier de liaison', serialNumber: 'FA68TA900611' },
                { name: 'Contrôleur 1', serialNumber: 'FA6BTJ001610' },
                { name: 'Contrôleur 2', serialNumber: 'FA6BTJ001608' },
                { name: 'Station infrarouge 1', serialNumber: 'FA6BTAA02247' },
                { name: 'Station infrarouge 2', serialNumber: 'FA6BKAA01806' },
            ],
        },
    });

    // 2. HTC Vive Pro Eye n°1
    await prisma.material.create({
        data: {
            name: 'HTC Vive Pro Eye #1',
            description: 'Casque HTC Vive équipé d’eye tracking. Utilisable avec stations et boîtier.',
            category: 'Casques',
            location: 'C120',
            serialNumber: 'FA1142101264',
            budget: 'IdEx Flavien 2022',
            status: 'AVAILABLE',
            imageUrl: 'https://www.vive.com/media/filer_public/b2/89/b289650f-2287-43ca-a36c-2f9801332219/vive-pro-eye-product-shot.png',
            components: [
                { name: 'Casque', serialNumber: 'FA12HAX00068' },
                { name: 'Boîtier de liaison', serialNumber: 'FA125A900057' },
                { name: 'Contrôleur 1', serialNumber: 'FA12JJ000818' },
                { name: 'Contrôleur 2', serialNumber: 'FA12JJ000822' },
                { name: 'Station infrarouge 1', serialNumber: 'FB0515B1F8' },
                { name: 'Station infrarouge 2', serialNumber: 'FB0515C7FF' },
            ],
        },
    });

    // 3. Meta Quest 3 n°1
    await prisma.material.create({
        data: {
            name: 'Meta Quest 3 #1',
            description: 'Malette comprenant le casque équipé d’une sangle Elite, 2 manettes et un câble USB-C.',
            category: 'Casques',
            location: 'C120',
            serialNumber: '2G0YC1ZG2W0B4H',
            // Budget unknown in source
            status: 'AVAILABLE',
            imageUrl: 'https://cdn.arstechnica.net/wp-content/uploads/2023/10/Quest-3-Review-Header.jpg',
            components: [
                { name: 'Casque', serialNumber: '2G0YC1ZG2W0B4H' },
                { name: 'Manette gauche', serialNumber: '2L0YYB6G2W00B9' },
                { name: 'Manette droite', serialNumber: '2L0YZB6G2W0ZMT' },
            ],
        },
    });

    // 4. Meta Quest Pro
    await prisma.material.create({
        data: {
            name: 'Meta Quest Pro',
            description: 'Malette comprenant le casque, 2 manettes, station de recharge et câble USB-C.',
            category: 'Casques',
            location: 'C120',
            serialNumber: '230YC01D9S0355',
            status: 'AVAILABLE',
            imageUrl: 'https://scontent-cdg4-3.xx.fbcdn.net/v/t39.8562-6/311384739_573523521255745_7109695624177726359_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=f537c7&_nc_ohc=t-Xy0gK2qBMAX_Xz9-R&_nc_ht=scontent-cdg4-3.xx&oh=00_AfD_Xy0gK2qBMAX_Xz9-R&oe=65C38473', // Placeholder or real
            components: [
                { name: 'Casque', serialNumber: '230YC01D9S0355' },
                { name: 'Station', serialNumber: '232ZY8P00CK' },
                { name: 'Manette gauche', serialNumber: 'N/A' },
                { name: 'Manette droite', serialNumber: 'N/A' },
            ],
        },
    });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
