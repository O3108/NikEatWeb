import styles from './styles.module.scss'
import Calculator from "@/src/app/components/client/Calculator";

export type Product = { name: string, value: number }
export type Settings = {
  "longMorning": number,
  "longEvening": number,
  "breakfast": number,
  "lunch": number,
  "dinner": number
}

export default async function Home() {
  return (
    <div className={styles.Home}>
      <h1>Покушаем</h1>
      <Calculator/>
    </div>
  );
}

