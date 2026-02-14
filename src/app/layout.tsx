import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { GameProvider } from "@/lib/game-context";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NeuroPlay AI - Cognitive Games for Kids",
  description: "A gamified cognitive screening tool for children aged 6-18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <GameProvider>
          {children}
        </GameProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
