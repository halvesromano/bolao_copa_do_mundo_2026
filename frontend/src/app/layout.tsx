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
          <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm mt-8">
            <div className="container mx-auto px-4 py-5 flex flex-col items-center gap-1 text-center">
              <p className="text-xs text-slate-500">
                Todos os direitos reservados<br />
                Desenvolvido por{" "}
                <a
                  href="https://github.com/halvesromano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wc-cyan hover:text-white transition-colors font-medium"
                >
                  @halvesromano
                </a>{" "}
                - 2026
              </p>
            </div>
          </footer>
        </AuthGuard>
      </body>
    </html>
  );
}

