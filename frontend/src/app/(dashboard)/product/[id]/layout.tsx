import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View detailed specifications and exact fit alignment for this garment based on your AI body scan.",
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
