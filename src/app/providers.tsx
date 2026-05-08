'use client'

import Script from "next/script";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as SoonerToaster } from "sonner";

import AuthProvider from "@/app/context/AuthProvider";
import { BlogProvider } from "@/app/context/BlogProvider";
import { InsertPaymentProvider } from "@/app/context/InsertPaymentProvider";
import { InsertProjectProvider } from "@/app/context/InsertProjectProvider";
import { InsertTopicProvider } from "@/app/context/InsertTopicProvider";
import { InsertUserProvider } from "@/app/context/InsertUserProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
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
                                <InsertPaymentProvider>
                                    <BlogProvider>
                                        <Script
                                            src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
                                            strategy="beforeInteractive"
                                        />
                                        <Script
                                            src="https://checkout.razorpay.com/v1/checkout.js"
                                            strategy="afterInteractive"
                                        />

                                        {children}
                                        <Toaster />
                                        <SoonerToaster />
                                        <Footer />
                                        <Analytics />
                                    </BlogProvider>
                                </InsertPaymentProvider>
                            </InsertProjectProvider>
                        </InsertTopicProvider>
                    </InsertUserProvider>
                </AuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}