import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import { SITE } from "@/lib/site";
import { Providers } from "@/components/Providers";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — велосипеди українського виробництва`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Ardis",
    "велосипеди Ardis",
    "купити велосипед Київ",
    "гірський велосипед",
    "міський велосипед",
    "гравійний велосипед",
    "велосипеди українського виробництва",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — велосипеди українського виробництва`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — велосипеди українського виробництва`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD організації — глобальний, на всіх сторінках
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    address: SITE.showrooms.map((s) => ({
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressLocality: "Київ",
      addressCountry: "UA",
    })),
  };

  return (
    <html lang="uk" className={`${unbounded.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
