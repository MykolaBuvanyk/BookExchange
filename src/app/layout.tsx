import type { Metadata } from "next";
import { Inter, Literata } from "next/font/google";
import { SiteHeader } from "@/components/layout";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "BookExchange",
  description: "Book exchange platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
