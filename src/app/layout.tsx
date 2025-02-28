import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Menu from "@/src/app/components/server/Menu";
import styles from './layout.module.scss'
import {getUrl} from "@/src/app/utils/common";
import StoreProvider from "@/src/app/StoreProvider";

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

const PRODUCTS_MOCK = [
  {
    "name": "Babyfox",
    "value": 2.2
  },
  {
    "name": "Ёжик",
    "value": 1.6
  },
  {
    "name": "Актимель",
    "value": 1
  },
  {
    "name": "Барни ",
    "value": 1.6
  },
  {
    "name": "Баунти на 2",
    "value": 1.6
  },
  {
    "name": "Баунти на 3",
    "value": 1.5
  },
  {
    "name": "Блин",
    "value": 1.2
  },
  {
    "name": "Булочка для бургера ",
    "value": 3
  },
  {
    "name": "Булочка для хот~дога ",
    "value": 3.6
  },
  {
    "name": "Бургер",
    "value": 3.5
  },
  {
    "name": "Греча",
    "value": 3
  },
  {
    "name": "Домашняя пицца ",
    "value": 1.2
  },
  {
    "name": "Дошик",
    "value": 4.5
  },
  {
    "name": "Картофель фри",
    "value": 3.5
  },
  {
    "name": "Картошка",
    "value": 2.6
  },
  {
    "name": "Каша овсяная из пакетика",
    "value": 2.6
  },
  {
    "name": "Киндер",
    "value": 1
  },
  {
    "name": "Киндер буэно 1 палочка",
    "value": 1
  },
  {
    "name": "Киндер макси ",
    "value": 1.2
  },
  {
    "name": "Киндер молочный ломтик",
    "value": 1
  },
  {
    "name": "Киндер шоколад",
    "value": 0.6
  },
  {
    "name": "Конфета ",
    "value": 1
  },
  {
    "name": "Круасан",
    "value": 3
  },
  {
    "name": "М&М s",
    "value": 3.3
  },
  {
    "name": "Макароны",
    "value": 3
  },
  {
    "name": "Марс",
    "value": 3.5
  },
  {
    "name": "Милкивей",
    "value": 1.8
  },
  {
    "name": "Молочный коктейль ",
    "value": 4
  },
  {
    "name": "Монетка",
    "value": 3.5
  },
  {
    "name": "Мороженое в стаканчике ",
    "value": 1.9
  },
  {
    "name": "Нагетс",
    "value": 0.3
  },
  {
    "name": "Орео",
    "value": 0.7
  },
  {
    "name": "Пельмень ",
    "value": 0.26
  },
  {
    "name": "Печенька с джемом",
    "value": 0.8
  },
  {
    "name": "Пирог домашний с мясом и картошкой  ",
    "value": 2.5
  },
  {
    "name": "Пицца",
    "value": 1.5
  },
  {
    "name": "Пюре",
    "value": 2.6
  },
  {
    "name": "Рис",
    "value": 4.3
  },
  {
    "name": "Ролл",
    "value": 1.1
  },
  {
    "name": "Слойка с витчиной и сыром ",
    "value": 2.3
  },
  {
    "name": "Сосиска в тесте ",
    "value": 2
  },
  {
    "name": "Стакан молока",
    "value": 1
  },
  {
    "name": "Суп",
    "value": 1
  },
  {
    "name": "Сырок простоквашино ",
    "value": 1.36
  },
  {
    "name": "Тук крекер",
    "value": 0.26
  },
  {
    "name": "Фаршированный блин морозко",
    "value": 1.8
  },
  {
    "name": "Хачапури",
    "value": 2
  },
  {
    "name": "Хлеб",
    "value": 1
  },
  {
    "name": "Чипсы лейс 70 гр",
    "value": 3.7
  },
  {
    "name": "Чипсы лейс 80 гр",
    "value": 4
  },
  {
    "name": "Чокопай",
    "value": 1.8
  },
  {
    "name": "Чудо молоко",
    "value": 2
  },
  {
    "name": "Шаньга",
    "value": 4
  },
  {
    "name": "Шаурма",
    "value": 2.5
  },
  {
    "name": "Эскимо",
    "value": 1.3
  }
]

const SETTINGS_MOCK = {
  "breakfast": 1.6,
  "dinner": 1,
  "longEvening": 6,
  "longMorning": 8,
  "lunch": 1.2
}

export default async function RootLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode;
}>) {
  const url = await getUrl()

  // const [responseProducts, responseSettings] = await Promise.all(
  //   [
  //     fetch(`${url}/api/products`, {method: 'GET'}),
  //     fetch(`${url}/api/settings`, {method: 'GET'})
  //   ]
  // );
  //
  // const products: Product[] | { error: string } = await responseProducts.json();
  // const settings: Settings = await responseSettings.json()
  //
  // if ('error' in products || 'error' in settings) return null

  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
    <div className={styles.Layout}>
      <div className={styles.Container}>
        <StoreProvider backSettings={SETTINGS_MOCK} backProducts={PRODUCTS_MOCK}>
          {children}
        </StoreProvider>
      </div>
    </div>
    <Menu/>
    </body>
    </html>
  );
}
