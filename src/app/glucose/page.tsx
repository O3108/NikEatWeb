import React from 'react';
import styles from './styles.module.scss'
import GlucoseList from "@/src/app/components/client/GlucoseList";

const Glucose = async () => {
  return (
    <div className={styles.Products}>
      <h1>Средний сахар</h1>
      <GlucoseList/>
    </div>
  );
};

export default Glucose;
