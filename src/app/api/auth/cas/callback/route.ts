import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encode } from "next-auth/jwt";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticket = searchParams.get('ticket');

    if (!ticket) {
        return NextResponse.redirect(new URL('/auth/signin?error=ticket_missing', request.url));
    }

    const serviceUrl = process.env.CAS_SERVICE_URL;
    const validateUrl = `https://cas.unistra.fr/cas/serviceValidate?service=${serviceUrl}&ticket=${ticket}`;

    try {
        const response = await fetch(validateUrl);
        const xmlData = await response.text();



        // Vérifier si l'authentification a réussi
        if (xmlData.includes('<cas:authenticationSuccess>')) {


            // Extraire le nom d'utilisateur
            const userMatch = xmlData.match(/<cas:user>([^<]+)<\/cas:user>/);
            const username = userMatch ? userMatch[1] : null;

            // Extraire l'email et le nom complet de CAS
            const emailMatch = xmlData.match(/<cas:mail>([^<]+)<\/cas:mail>/);
            const displayNameMatch = xmlData.match(/<cas:displayName>([^<]+)<\/cas:displayName>/);

            const casEmail = emailMatch ? emailMatch[1] : null;
            const displayName = displayNameMatch ? displayNameMatch[1] : username;

            console.log('Username:', username);
            console.log('Email CAS:', casEmail);
            console.log('Display Name CAS:', displayName);

            if (!casEmail) {

                return NextResponse.redirect(new URL('/auth/signin?error=no_email', request.url));
            }

            // Vérifie si l'utilisateur existze déjà
            let user = await prisma.user.findUnique({
                where: { email: casEmail }
            });

            console.log('Utilisateur existant trouvé:', user ? 'OUI' : 'NON');

            // Si l utilisateur n'existe pas, on le crée
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: displayName,
                        email: casEmail,
                        emailVerified: new Date(),
                    }
                });

            } else {

            }



            // Créer un token JWT NextAuth
            const secret = process.env.NEXTAUTH_SECRET;
            if (!secret) {

                return NextResponse.redirect(new URL('/auth/signin?error=config_error', request.url));
            }

            const cookieName = process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token';

            const token = await encode({
                token: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                secret: secret,
                salt: cookieName,
                maxAge: 30 * 24 * 60 * 60, // 30 jours
            });

            // Créer la réponse avec redirection
            const response = NextResponse.redirect(new URL('/', request.url));


            // Définir le cookie de session NextAuth
            response.cookies.set(cookieName, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });



            return response;

        } else if (xmlData.includes('<cas:authenticationFailure>')) {
            // Extraire le message d'erreur
            const errorMatch = xmlData.match(/<cas:authenticationFailure[^>]*>([^<]+)<\/cas:authenticationFailure>/);
            const error = errorMatch ? errorMatch[1] : 'Échec d\'authentification';

            console.error('Erreur CAS:', error);
            return NextResponse.redirect(new URL('/auth/signin?error=cas_failed', request.url));
        }

        return NextResponse.redirect(new URL('/auth/signin?error=invalid_response', request.url));

    } catch (error) {
        console.error('Erreur lors de la validation CAS:', error);
        return NextResponse.redirect(new URL('/auth/signin?error=server_error', request.url));
    }
}
