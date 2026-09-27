import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import "./swiper.css";
import AppProviders from "./providers";

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-nanum-myeongjo",
});

export const metadata: Metadata = {
  title: "Insert",
  description: "A platform made for developers and their day to day needs",
  icons: {
    icon: '/panda-bear.png',
    shortcut: '/panda-bear.png',
    apple: '/panda-bear.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nanumMyeongjo.variable} ${nanumMyeongjo.className}`} suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
