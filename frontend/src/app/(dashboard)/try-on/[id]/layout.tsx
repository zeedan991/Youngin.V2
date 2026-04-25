import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Try-On",
  description:
    "See how this garment maps onto your exact physical dimensions in true 3D space.",
};

export default function TryOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
