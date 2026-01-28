import { ReactNode } from "react";

export default function DailyLayout({ children }: { children: ReactNode }) {
  return <section className="h-screen">{children}</section>
}
