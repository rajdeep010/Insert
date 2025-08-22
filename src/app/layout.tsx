import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import "dotenv/config";
import Script from "next/script";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TopicProvider } from "./context/TopicProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { BlogProvider } from "./context/BlogProvider";
import { InsertUserProvider } from "./context/InsertUserProvider";
import { InsertTopicProvider } from "./context/InsertTopicProvider";
import { InsertProjectProvider } from "./context/InsertProjectProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Insert",
  description: "Create your own coding problem sheet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthProvider>
              <InsertUserProvider>
                <InsertTopicProvider>
                  <InsertProjectProvider>
                    <BlogProvider>
                      <Script
                        src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
                        strategy="beforeInteractive"
                      />
                      {children}
                      <Toaster />
                      <Footer />
                      <Analytics />
                    </BlogProvider>
                  </InsertProjectProvider>
                </InsertTopicProvider>
              </InsertUserProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
