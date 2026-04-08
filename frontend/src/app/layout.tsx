import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://youngin.fashion"),
  title: {
    default: "YOUNGIN | AI-Powered Fashion Fit Technology",
    template: "%s | YOUNGIN",
  },
  description:
    "YOUNGIN maps your exact body geometry — 33 landmarks, ±1mm precision — and connects you to a custom fashion network. No more size charts. Dressed perfectly, every time.",
  keywords: [
    "AI fashion",
    "body scan",
    "custom fit clothing",
    "virtual fitting room",
    "personalized fashion",
    "AI sizing",
    "custom apparel",
    "YOUNGIN",
    "fashion tech",
    "3D body scan",
  ],
  authors: [{ name: "Youngin Inc." }],
  creator: "Youngin Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://youngin.fashion",
    siteName: "YOUNGIN",
    title: "YOUNGIN | AI-Powered Fashion Fit Technology",
    description:
      "Map your exact body geometry in seconds. Shop a wardrobe that fits the body you actually have.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YOUNGIN — AI Fashion Fit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YOUNGIN | AI-Powered Fashion Fit Technology",
    description:
      "Map your exact body geometry in seconds. Shop a wardrobe that fits the body you actually have.",
    images: ["/og-image.png"],
    creator: "@youngin_fashion",
  },
  other: {
    "theme-color": "#0A0A0A",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
