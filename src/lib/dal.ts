import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function getUser() {
    const session = await auth();
    return session?.user;
}

export async function getAdminEmails(): Promise<string[]> {
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true },
    });
    return admins.map((a) => a.email);
}
