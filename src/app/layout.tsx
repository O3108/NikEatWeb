import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Menu from "@/src/app/components/server/Menu";
import styles from './layout.module.scss'
import {getUrl} from "@/src/app/utils/server";
import StoreProvider, {Glucose, Product, Settings} from "@/src/app/StoreProvider";

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
  const url = await getUrl()

  const [responseProducts, responseSettings, responseAvgGlucose] = await Promise.all(
    [
      fetch(`${url}/api/products`, {method: 'GET'}),
      fetch(`${url}/api/settings`, {method: 'GET'}),
      fetch(`${url}/api/glucose`, {method: 'GET'}),
    ]
  );

  const products: Product[] | { error: string } = await responseProducts.json();
  const settings: Settings = await responseSettings.json();
  const glucose: Glucose = await responseAvgGlucose.json()

  if ('error' in products || 'error' in settings) return null

  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
    <div className={styles.Layout}>
      <div className={styles.Container}>
        <StoreProvider backSettings={settings} backProducts={products} backGlucose={glucose}>
          {children}
        </StoreProvider>
      </div>
    </div>
    <Menu/>
    </body>
    </html>
  );
}
