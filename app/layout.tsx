import type { Metadata } from "next";
import { DM_Sans, Gilda_Display, Pinyon_Script } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

// Elegant serif for display headings + stat numbers (design `Gilda Display`).
const gilda = Gilda_Display({
  variable: "--font-gilda",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Calligraphic accent for the couple's names (design `Pinyon Script`).
const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding RSVP · Admin",
  description: "Admin console for managing wedding RSVPs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${gilda.variable} ${pinyon.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
