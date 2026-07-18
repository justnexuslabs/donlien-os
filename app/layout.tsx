import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DONLIEN.XYZ",
  description: "The classified alien operating system for the LIENIVERSE.",
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
