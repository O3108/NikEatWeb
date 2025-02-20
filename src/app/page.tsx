import styles from './styles.module.scss'
import Calculator from "@/src/app/components/client/Calculator";
import {getUrl} from "@/src/app/utils/common";

export type Product = { name: string, value: number }
export type Settings = {
  "longMorning": number,
  "longEvening": number,
  "breakfast": number,
  "lunch": number,
  "dinner": number
}

export default async function Home() {
  const url = await getUrl()
  const [responseProducts, responseSettings] = await Promise.all(
    [
      fetch(`${url}/api/products`, {method: 'GET'}),
      fetch(`${url}/api/settings`, {method: 'GET'})
    ]
  );
  const products: Product[] = await responseProducts.json();
  const settings: Settings = await responseSettings.json()

  return (
    <div className={styles.Home}>
      <h1>Покушаем</h1>
      <Calculator products={products} settings={settings}/>
    </div>
  );
}

