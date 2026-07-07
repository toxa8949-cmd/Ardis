import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import Script from "next/script";
import { SITE } from "@/lib/site";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Google Analytics 4
const GA_ID = "G-N7FPEDKL54";
// Google Ads (відстеження конверсій)
const ADS_ID = "AW-969652830";

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
  // Явні іконки з версією у назві (-v2) — щоб Google переобійшов фавікон
  // (Googlebot агресивно кешує старий). Білий логотип на чорному тлі читається
  // і в світлій, і в темній темі видачі.
  icons: {
    icon: [
      { url: "/icon-v2.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-v2.ico",
    apple: "/apple-icon-v2.png",
  },
  title: {
    default: `${SITE.name} — велосипеди українського виробництва`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Ardis",
    "Ардіс",
    "велосипеди Ardis",
    "велосипеди Ардіс",
    "купити велосипед Київ",
    "купити велосипед у Києві",
    "велосипеди Київ",
    "веломагазин Київ",
    "магазин велосипедів Київ",
    "купити велосипед",
    "гірський велосипед Київ",
    "дитячий велосипед Київ",
    "електровелосипед Київ",
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
  // JSON-LD: магазин велосипедів у Києві (локальне SEO) + сайт із пошуком.
  const c = SITE.contacts;
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "BicycleStore",
    "@id": `${SITE.url}/#store`,
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: SITE.url,
    image: `${SITE.url}/opengraph-image`,
    telephone: `+380${c.phoneShopRaw.replace(/^0/, "")}`,
    priceRange: "₴₴",
    currenciesAccepted: "UAH",
    paymentAccepted: "Готівка, картка, безготівковий розрахунок",
    address: {
      "@type": "PostalAddress",
      streetAddress: "вул. Ревуцького, 40В",
      addressLocality: c.addressLocality,
      addressRegion: c.region,
      postalCode: c.postalCode,
      addressCountry: "UA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: c.geo.lat,
      longitude: c.geo.lng,
    },
    areaServed: [
      { "@type": "City", name: "Київ" },
      { "@type": "Country", name: "Україна" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "16:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: "uk-UA",
    publisher: { "@id": `${SITE.url}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="uk" className={`${unbounded.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>{children}</Providers>

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
            gtag('config', '${ADS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
