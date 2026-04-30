import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "БИОЗИД | Енергоефективни сглобяеми къщи", // Текстът в таба на браузъра
  description: "Екологично бързо строителство на къщи във фабрична среда, 3D модели и чертежи за панели БИОЗИД.", // Описанието под линка в Google
  
  // Тук въвеждаш твоите ключови думи, разделени със запетая
  keywords: ["биозид", "строителни панели", "калкулатор за панели", "3D чертане", "сухо строителство", "сглобяеми къщи", "сглобяеми къщи с метална конструкция"], 
  
  // Настройки за споделяне във Facebook, Viber и др.
  openGraph: {
    title: "БИОЗИД | Енергоефективни сглобяеми къщи",
    description: "Екологично бързо строителство на къщи във фабрична среда, 3D модели и чертежи за панели БИОЗИД.",
    url: "https://biozid.bg", // ВАЖНО: Смени с реалния си домейн
    siteName: "БИОЗИД",
    images: [
      {
        url: "/og-image.jpg", // Сложи подходяща картинка (напр. лого) в папка public
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
      lang="bg" // Сменено от "en" на "bg" за правилно SEO на български
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}