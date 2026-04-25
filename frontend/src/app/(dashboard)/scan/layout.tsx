import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Body Sizing",
  description:
    "Upload two photos for a precision 3D body scan — 33 landmarks, ±1mm accuracy, powered by MediaPipe and MiDaS depth estimation.",
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
