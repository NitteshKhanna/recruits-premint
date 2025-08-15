import type { Metadata } from "next";
import Web3Provider from "./utils/Web3Provider";
import localFont from "next/font/local";
import "./globals.css";
import "./page.scss";
import "./fonts.scss";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import SocialsFooter from "./components/socialsFooter/socialsFooter";
import { LoadingProvider } from "@/contexts/LoadingContext";
import Loading from "./components/loading/loading";

export const metadata: Metadata = {
  title: "Recruits",
  description: "Break free from control",
  
  openGraph: {
    title: "Recruits",
    description: "Break free from control",
    url: "https://www.recruits.world",
    siteName: "Recruits",
    type: "website",
    images: [
      {
        url: "https://www.recruits.world/images/logoColor.svg",
        width: 1200,
        height: 630,
        alt: "The Recruits Logo",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "The Recruits",
    description: "Break free from control",
    site: "@Recruitsworld",
    creator: "@Recruitsworld",
    images: ["https://www.recruits.world/images/logoColor.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <LoadingProvider>
        <Web3Provider>
          <body>
            <Loading />
            <div className="page">
              <Header />
              <main>{children}</main>
              <SocialsFooter />
              <Footer />
            </div>
          </body>
        </Web3Provider>
      </LoadingProvider>
    </html>
  );
}