import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

// Fonte dos títulos (h1, h2, h3, nomes em destaque).
const titulo = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-titulo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cynthia & Benhur — Confirmação de Presença",
  description:
    "Casamento de Cynthia e Benhur. Evento privado, vagas limitadas. Confirme sua presença até 10/09.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${serif.variable} ${sans.variable} ${titulo.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
