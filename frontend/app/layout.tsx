import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Naturals Salon Management",
  description: "Advanced Salon ERP and POS System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
