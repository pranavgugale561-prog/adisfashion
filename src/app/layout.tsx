import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import MovingBackground from "@/components/InteractiveBackground";
import PageLoader from "@/components/PageLoader";
import LeadCatcher from "@/components/LeadCatcher";
import FirebaseProvider from "@/components/FirebaseProvider";

import ChatWidget from "@/components/ChatWidget";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ADIS — Pop Culture Fashion",
  description: "Pop culture apparel & merchandise. Marvel, Anime, DC & more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {/* FirebaseProvider syncs products & landing config from Firebase into the Zustand store */}
        <FirebaseProvider>
          <PageLoader />
          <MovingBackground />
          <CustomCursor />
          <LeadCatcher />
          <ChatWidget />
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
