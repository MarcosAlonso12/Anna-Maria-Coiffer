import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anna Maria Coiffer | Perfumes e cuidados",
  description: "Conheça os produtos da Anna Maria Coiffer e envie seu pedido online.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head><link rel="stylesheet" href="/store.css"/></head><body className="antialiased">{children}</body>
    </html>
  );
}
