import styles from './styles.module.scss'
import Calculator from "@/src/app/components/client/Calculator";

export default async function Home() {
  return (
    <div className={styles.Home}>
      <h1>Покушаем</h1>
      <Calculator/>
    </div>
  );
}

