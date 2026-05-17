import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/providers/AppProviders";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { SITE_URL } from "@/lib/env";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "THE SYNTRAA · Luxury cinematic commerce",
    template: "%s · THE SYNTRAA",
  },
  description:
    "Luxury in every layer. Cinematic 3D commerce for refined objects and editions.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "THE SYNTRAA",
    title: "THE SYNTRAA · Luxury cinematic commerce",
    description: "Luxury in every layer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full">
        <OrganizationJsonLd />
        <AppProviders>
          <Navbar />
          <div className="pt-24">{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
