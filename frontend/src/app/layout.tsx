import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const openSans = localFont({
  variable: "--font-sans-local",
  display: "swap",
  src: [
    {
      path: "./fonts/OpenSans-VariableFont_wdth,wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "./fonts/OpenSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
});

export const metadata: Metadata = {
  title: "HillNest Homestay — A Calm Mountain Stay Near Siliguri",
  description:
    "Experience peaceful rooms, fresh air, and warm hospitality at HillNest — a luxury mountain homestay near Siliguri, West Bengal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${openSans.variable} h-full antialiased`}
      style={{ colorScheme: "light", background: "#ffffff" }}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
