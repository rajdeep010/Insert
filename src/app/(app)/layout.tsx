import AppFeatureProviders from "./providers";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppFeatureProviders>{children}</AppFeatureProviders>
    </div>
  );
}
