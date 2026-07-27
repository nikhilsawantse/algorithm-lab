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
  const imageUrl = `${protocol}://${host}/og.png`;
  const description = "An interactive Bubble Sort visualizer, JavaScript walkthrough, and adjacent-swap challenge.";

  return {
    title: "Bubble Lab — Learn Bubble Sort Visually",
    description,
    openGraph: {
      title: "Bubble Lab — Learn Bubble Sort Visually",
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Bubble Lab — see every swap and understand every pass" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bubble Lab — Learn Bubble Sort Visually",
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
