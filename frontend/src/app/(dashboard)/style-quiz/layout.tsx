import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style Quiz",
  description:
    "Build your aesthetic DNA profile — vibe, fit preference, color palette, and values — for personalized fashion recommendations.",
};

export default function StyleQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
