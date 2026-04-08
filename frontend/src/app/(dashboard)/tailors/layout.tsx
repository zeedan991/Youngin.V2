import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tailor Network",
  description: "Connect with verified local tailors for bespoke manufacturing — your AI measurements are encrypted and injected into their workflow.",
};

export default function TailorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
