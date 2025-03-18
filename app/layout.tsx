import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DialogProvider } from "@/contexts/DialogContext";
import { WijmoDialogProvider } from "@/contexts/WijmoDialogContext";
import AppBar from "@/components/AppBar";
import "@mescius/wijmo.styles/wijmo.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "架空の受注システム",
  description: "架空の受注システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DialogProvider>
          <WijmoDialogProvider>
            <AppBar />
            <div className="mx-auto pt-16">
              <main>{children}</main>
            </div>
            <Toaster />
          </WijmoDialogProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
