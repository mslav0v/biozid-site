import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Оптимизация за бързо зареждане на шрифта
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// --- 1. МОБИЛЕН VIEWPORT И ТЕМА ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

// --- 2. SEO И НАСТРОЙКИ ЗА СПОДЕЛЯНЕ И AI БОТОВЕ ---
export const metadata: Metadata = {
  metadataBase: new URL("https://biozid.bg"),
  title: {
    default: "БИОЗИД | Енергоефективни сглобяеми къщи и конопени панели",
    template: "%s | БИОЗИД",
  },
  description: "БИОЗИД - Екологично бързо строителство на сглобяеми къщи с конопена изолация (Hempcrete) във фабрична среда. 3D модели, чертежи и калкулатор.",
  keywords: [
    "биозид",
    "конопени панели",
    "конопена изолация",
    "сглобяеми къщи",
    "екологично строителство",
    "пасивни къщи",
    "модулни къщи",
    "сухо строителство",
    "строителни панели",
    "калкулатор за сглобяеми къщи",
    "сглобяеми къщи с метална конструкция"
  ],
  authors: [{ name: "БИОЗИД ЕООД", url: "https://biozid.bg" }],
  creator: "БИОЗИД ЕООД",
  publisher: "БИОЗИД ЕООД",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://biozid.bg",
  },
  
  // Google Site Verification
  verification: {
    google: "NNoCCzEj9KEfpEXMDtXvTe-TxFv07p2PKx1KXa1cUfQ",
  },

  // Инструкции за търсачки и ботове
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // OpenGraph за Facebook, LinkedIn, Viber
  openGraph: {
    title: "БИОЗИД | Енергоефективни сглобяеми къщи и конопени панели",
    description: "Екологично бързо строителство на сглобяеми къщи с конопена изолация във фабрична среда. 3D модели и калкулатор.",
    url: "https://biozid.bg", 
    siteName: "БИОЗИД",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "БИОЗИД - Сглобяеми конопени къщи",
      },
    ],
    locale: "bg_BG",
    type: "website",
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "БИОЗИД | Енергоефективни сглобяеми къщи",
    description: "Екологично бързо строителство на сглобяеми къщи с конопена изолация.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

// --- 3. JSON-LD СТРУКТУРИРАНИ ДАННИ ЗА ОРГАНИЗАЦИЯТА И САЙТА ---
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://biozid.bg/#organization",
      "name": "БИОЗИД ЕООД",
      "url": "https://biozid.bg",
      "logo": "https://biozid.bg/logo.png",
      "image": "https://biozid.bg/og-image.jpg",
      "description": "Проектиране и производство на сглобяеми екологични къщи и конопени строителни панели.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BG",
        "addressLocality": "Варна"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Bulgarian", "English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://biozid.bg/#website",
      "url": "https://biozid.bg",
      "name": "БИОЗИД",
      "publisher": {
        "@id": "https://biozid.bg/#organization"
      },
      "inLanguage": "bg-BG"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Инжектиране на микроданните за AI агенти и търсачки */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {/* --- GOOGLE ANALYTICS (GA4) --- */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Съдържанието на сайта */}
        {children}
      </body>
    </html>
  );
}