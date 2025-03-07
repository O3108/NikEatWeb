"use client"

import React from 'react';
import styles from './styles.module.scss'
import {useStore} from "@/src/app/StoreProvider";

const GlucoseList = () => {
  const {glucose} = useStore()
  return (
    <div className={styles.GlucoseList}>
      <h2>Средний день ({glucose?.day.date}) — {Math.round((glucose?.day.value || 0) * 10) / 10}</h2>
      <h2>Средний ночь ({glucose?.night.date}) — {Math.round((glucose?.night.value || 0) * 10) / 10}</h2>
    </div>
  );
};

export default GlucoseList;
