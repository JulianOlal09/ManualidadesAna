import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import FloatingCart from "@/components/layout/FloatingCart";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manualidades Ana",
  description: "Tienda online de manualidades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <FloatingCart />
            <footer className="hidden md:block bg-gray-50 border-t py-6">
              <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                © 2024 Manualidades Ana. Todos los derechos reservados.
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
