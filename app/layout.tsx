import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "14Eter Limited | Technical Software Partner",
  description:
    "Powering Information & Communication with cutting-edge ICT solutions designed to grow your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}