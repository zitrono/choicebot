import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://verbier-demo.vercel.app"),
  title: "Festival Concierge | Verbier Festival 2025",
  description: "Festival Concierge for the Verbier Festival - your personal guide to creating customized classical music experiences in the Swiss Alps. Get personalized concert recommendations from 200+ performances featuring world-renowned artists.",
  keywords: ["Verbier Festival", "classical music", "Swiss Alps", "concerts", "Martha Argerich", "festival concierge"],
  openGraph: {
    title: "Festival Concierge | Verbier Festival",
    description: "Your Festival Concierge - discover your perfect classical music experience at Verbier Festival",
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
          storageKey="verbier-theme"
        >
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
