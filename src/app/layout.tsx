import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import ThreeBackground from "@/components/ThreeBackground";
import PageLoader from "@/components/PageLoader";
import LeadCatcher from "@/components/LeadCatcher";
import FirebaseProvider from "@/components/FirebaseProvider";
import BackgroundMusic from "@/components/BackgroundMusic";
import ChatWidget from "@/components/ChatWidget";
import AnalyticsTracker from "@/components/AnalyticsTracker";

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
      <head>
        <link rel="preconnect" href="https://drive.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="preload" href="/videos/loader-video.mp4" as="video" type="video/mp4" />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {/* FirebaseProvider syncs products & landing config from Firebase into the Zustand store */}
        <FirebaseProvider>
          <AnalyticsTracker />
          <PageLoader />
          <ThreeBackground />
          <CustomCursor />
          <LeadCatcher />
          <BackgroundMusic />
          <ChatWidget />
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
