import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import type { Locale } from "@/lib/i18n/dictionaries";

const cairo = Cairo({
  variable: "--font-app",
  subsets: ["latin", "arabic"],
});

export const metadata: Metadata = {
  title: "Karam OS",
  description: "Tasks & projects, organized.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} h-full`}>
      <body className="min-h-full">
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
