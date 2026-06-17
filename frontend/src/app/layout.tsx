import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Glyph — Bitcoin Ordinals on Stacks",
  description: "Wrap, stake, bridge, and collateralize Bitcoin Ordinals on Stacks",
  other: {
    "talentapp:project_verification":
      "176655e345ad715d30538c429377a009cf331326bf26635a3f11572a85246f55b04b84cffdc02bfe508e4356b796da9cdb51dc2a4795ebbfb248c8d35898a08f",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <WalletProvider><ToastProvider>{children}</ToastProvider></WalletProvider>
      </body>
    </html>
  );
}
