import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Stylist",
  description:
    "Your personal AI fashion advisor powered by Gemini — knows your measurements, style preferences, and what's trending.",
};

export default function AIStylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
