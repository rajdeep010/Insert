import { TooltipProvider } from "@radix-ui/react-tooltip";

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </div>
    );
}
