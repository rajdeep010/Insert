import "../swiper.css";

import AppFeatureProviders from "./providers";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
        <div className="flex flex-col min-h-screen">
          <AppFeatureProviders>
              {children}
          </AppFeatureProviders>
        </div>
    </>
  );
}
