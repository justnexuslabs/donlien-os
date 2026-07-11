import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DonLien OS",
  description: "The operating layer for the Lieniverse.",
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
