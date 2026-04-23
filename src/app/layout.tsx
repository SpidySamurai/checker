import type { Metadata } from "next";
import "./globals.css";
import { kalam, caveat, inconsolata } from "./fonts";

export const metadata: Metadata = {
  title: "Checker — Gestión de flotillas",
  description: "Control de asistencia y viajes para conductores de plataformas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${kalam.variable} ${caveat.variable} ${inconsolata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
