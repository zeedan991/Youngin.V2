import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Design Studio",
  description: "Design custom garments on your real 3D avatar in-browser using React Three Fiber and WebGL.",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
