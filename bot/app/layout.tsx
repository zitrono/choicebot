import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

// Generic metadata for root layout
export const metadata: Metadata = {
  metadataBase: new URL("https://choice-bot.vercel.app"),
  title: "Choice Bot - Specialized AI Assistants",
  description: "Access specialized AI assistants for various domains including classical music festivals and medical diagnostics.",
  keywords: ["AI assistant", "chatbot", "specialized AI", "medical assistant", "festival concierge"],
  openGraph: {
    title: "Choice Bot - Specialized AI Assistants",
    description: "Access specialized AI assistants for various domains",
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
          storageKey="choice-bot-theme"
        >
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
