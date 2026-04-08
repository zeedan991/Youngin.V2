import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thrift Shop",
  description: "AI-curated vintage pieces matched to your style quiz and exact body measurements. Every item verified to fit.",
};

export default function ThriftLayout({ children }: { children: React.ReactNode }) {
  return children;
}
