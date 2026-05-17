import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bolão Copa do Mundo 2026",
  description: "Faça seus palpites e participe do melhor bolão da Copa do Mundo de 2026!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <AuthGuard>
          <Navbar />
          {/* pt-16 para compensar a altura da Navbar fixa */}
          <main className="pt-16">
            {children}
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
