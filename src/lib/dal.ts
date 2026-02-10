import { auth } from '@/auth';

export default async function getUser() {
    const session = await auth();
    return session?.user;
}
