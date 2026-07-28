import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og-v2.png`;
  const description = "Free interactive algorithm lessons with visualizations, tested code, guided examples, and challenges.";

  return {
    title: "Algorithm Lab — Understand Algorithms Visually",
    description,
    openGraph: {
      title: "Algorithm Lab — Understand Algorithms Visually",
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Algorithm Lab — free interactive algorithm lessons" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Algorithm Lab — Understand Algorithms Visually",
      description,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${dmMono.variable}`}>{children}</body>
    </html>
  );
}
