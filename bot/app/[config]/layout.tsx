import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfig } from "@/lib/config/get-config";

export async function generateMetadata({ params }: { params: { config: string } }): Promise<Metadata> {
  const config = getConfig(params.config);
  
  if (!config) {
    return {
      title: "Not Found",
      description: "Configuration not found",
    };
  }

  return {
    title: config.branding.appTitle,
    description: config.metadata.longDescription,
    keywords: config.metadata.keywords,
    openGraph: {
      title: config.ui.openGraph.title,
      description: config.ui.openGraph.description,
      type: "website",
    },
  };
}

export default function ConfigLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { config: string };
}) {
  const config = getConfig(params.config);
  
  if (!config) {
    notFound();
  }

  return <>{children}</>;
}