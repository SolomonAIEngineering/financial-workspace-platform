import type { Metadata } from "next";
import { MiniSidebar } from "@/components/sidebar/mini-sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactQueryProvider } from "@/providers/react-query";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const TITLE = "Powerful Data-Table for React | OpenStatus";
const DESCRIPTION =
  "Flexible, fast, and easy-to-use filters with tanstack table, shadcn/ui and search params via nuqs.";

export const metadata: Metadata = {
  metadataBase: new URL("https://data-table.openstatus.dev"),
  title: TITLE,
  description: DESCRIPTION,
  twitter: {
    images: ["/assets/data-table-infinite.png"],
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  openGraph: {
    type: "website",
    images: ["/assets/data-table-infinite.png"],
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ReactQueryProvider>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </NuqsAdapter>
      </ReactQueryProvider>
    </div>
  );
}
