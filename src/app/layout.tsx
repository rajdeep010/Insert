import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/app/context/AuthProvider';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "./context/UserProvider";
// import { TopicProvider } from "./context/TopicProvider";
import 'dotenv/config'
import Script from "next/script";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TopicProvider } from "./context/TopicProvider";
import { ThemeProvider } from "@/components/ThemeProvider"
import Footer from "@/components/Footer";



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
    <html lang="en">
      <TooltipProvider>
        <AuthProvider>
          <UserProvider>
            <TopicProvider>
              <body className={inter.className}>
                <Script
                  src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
                  strategy="beforeInteractive"
                />
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster />
                  <Footer/>
                </ThemeProvider>
              </body>
            </TopicProvider>
          </UserProvider>
        </AuthProvider>
      </TooltipProvider>
    </html>
  );
}
