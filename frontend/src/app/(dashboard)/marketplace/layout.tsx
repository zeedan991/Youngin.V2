import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Aggregator",
  description:
    "Shop millions of garments from Nike, Zara, H&M, and more — automatically filtered to your exact body geometry.",
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
