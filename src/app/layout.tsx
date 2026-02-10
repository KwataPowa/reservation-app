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
      <body className="min-h-screen bg-[#F1F5F9] flex">
        <Navbar />
        {/* Main content shifted right to accommodate sidebar */}
        <main className="flex-1 ml-16 transition-all duration-300 p-8 w-full max-w-[1920px]">
          {children}
        </main>
      </body>
    </html>
  );
}
