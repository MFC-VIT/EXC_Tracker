import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EXC Attendance Tracker",
  description: "Track attendance and 90-hour completion for Mozilla Firefox Club EXC courses."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
