import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { TrustProvider } from "@/components/trust-store";
import { ZikiHeader } from "@/components/ziki-header";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ziki · Agents ask to grow",
  description:
    "A working reproduction of Ziki's agent settings with one change: agents earn new levels by asking their owner, instead of a dropdown and silent automatic promotion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <TrustProvider>
          <div className="flex min-h-screen flex-col bg-zk-bg">
            <Suspense fallback={<div className="h-[69px] border-b border-zk-border bg-zk-surface" />}>
              <ZikiHeader />
            </Suspense>
            <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6 sm:py-8 max-lg:pb-28">{children}</main>
          </div>
        </TrustProvider>
      </body>
    </html>
  );
}
