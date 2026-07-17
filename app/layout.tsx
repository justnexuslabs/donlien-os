import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DONLIEN.XYZ",
  description: "The classified alien operating system for the LIENIVERSE.",
  icons: {
    icon: "/images/donlien-logo.png",
    apple: "/images/donlien-logo.png",
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
