import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DonLien.xyz · Claim Your LIEN ID",
  description: "Create a living identity that carries your GLB, level, role, achievements, and seasonal history across the LIENIVERSE.",
  icons: {
    icon: "/images/donlien-badge.svg",
    apple: "/images/donlien-badge.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
