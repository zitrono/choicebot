import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { getConfig } from "@/lib/config/get-config";

import "./globals.css";

// Load configuration
const config = getConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.metadata.domain),
  title: config.branding.appTitle,
  description: config.metadata.longDescription,
  keywords: config.metadata.keywords,
  openGraph: {
    title: config.ui.openGraph.title,
    description: config.ui.openGraph.description,
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey={config.branding.themeStorageKey}
        >
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
