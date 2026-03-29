import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const fredokaOne = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: "400",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Flag Explorer - Discover the World!",
  description: "Learn about the flags of every country in the world through interactive lessons, quizzes, and games. Perfect for kids and geography lovers!",
  keywords: ["flags", "geography", "education", "countries", "kids", "quiz"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredokaOne.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: '#0f172a', color: '#f8fafc', fontFamily: 'var(--font-nunito, Nunito, sans-serif)' }}>
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-white/30 text-sm">
          <p>⛵ Flag Explorer — Discover the World, One Flag at a Time!</p>
        </footer>
      </body>
    </html>
  );
}
