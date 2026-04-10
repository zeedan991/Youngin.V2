import { ReactNode } from "react";

// Studio gets its own full-bleed layout — no extra padding from the dashboard wrapper
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
