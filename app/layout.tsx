import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- SEO И НАСТРОЙКИ ЗА СПОДЕЛЯНЕ ---
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production' 
      ? 'https://www.biozid.bg' 
      : 'http://localhost:3001'
  ),
  title: "БИОЗИД | Енергоефективни сглобяеми къщи",
  description: "Екологично бързо строителство на къщи във фабрична среда, 3D модели и чертежи за панели БИОЗИД.",
  keywords: ["биозид", "строителни панели", "калкулатор за панели", "3D чертане", "сухо строителство", "сглобяеми къщи", "сглобяеми къщи с метална конструкция"], 
  
  // ---> ДОБАВЕНО: Google Site Verification <---
  verification: {
    google: "NNoCCzEj9KEfpEXMDtXvTe-TxFv07p2PKx1KXa1cUfQ",
  },

  openGraph: {
    title: "БИОЗИД | Енергоефективни сглобяеми къщи",
    description: "Екологично бързо строителство на къщи във фабрична среда, 3D модели и чертежи за панели БИОЗИД.",
    url: "https://www.biozid.bg", 
    siteName: "БИОЗИД",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
      },
    ],
    locale: "bg_BG",
    type: "website",
  },
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
      <body className="min-h-full flex flex-col">
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