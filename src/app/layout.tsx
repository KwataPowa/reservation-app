import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ICUBE Resa - Réservation de matériel",
  description: "Plateforme de réservation de matériel pour le laboratoire ICUBE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f8f9fa]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
