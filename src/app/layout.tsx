import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Menu from "@/src/app/components/server/Menu";
import styles from './layout.module.scss'
import StoreProvider from "@/src/app/Providers/StoreProvider";
import AlertProvider from "@/src/app/Providers/AlertProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NikEat",
};

export default async function RootLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
    <div className={styles.Layout}>
      <div className={styles.Container}>
        <StoreProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </StoreProvider>
      </div>
    </div>
    <Menu/>
    </body>
    </html>
  );
}
