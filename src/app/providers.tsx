'use client'

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as SoonerToaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";
import PushNotificationsListener from "@/components/PushNotificationsListener";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/features/auth/context/AuthProvider";

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
                    <PushNotificationsListener />
                    {children}
                    <Toaster />
                    <SoonerToaster />
                    <Footer />
                    <Analytics />
                </AuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}