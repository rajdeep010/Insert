import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
        <div className="flex flex-col min-h-screen">
          <TooltipProvider>
              {children}
          </TooltipProvider>
        </div>
    </>
  );
}
