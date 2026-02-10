import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ICUBE Resa - Plateforme Scientifique",
  description: "Système de réservation de matériel haute performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#F1F5F9]" style={{ paddingTop: '4rem' }}>
        <Navbar />
        <main className="p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          {children}
        </main>
      </body>
    </html>
  );
}
