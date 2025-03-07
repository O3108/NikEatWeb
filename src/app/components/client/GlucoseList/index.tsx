"use client"

import React from 'react';
import styles from './styles.module.scss'
import {useStore} from "@/src/app/StoreProvider";

const GlucoseList = () => {
  const {glucose} = useStore()
  return (
    <div className={styles.GlucoseList}>
      <h2>Средний день ({glucose?.day.date}) —{' '}
        <span
          className={(glucose?.day.value || 0) < 6
            ? styles.Red
            : (glucose?.day.value || 0) > 10
              ? styles.Orange
              : styles.Green}
        >
          {Math.round((glucose?.day.value || 0) * 10) / 10}
        </span>
      </h2>
      <h2>Средний ночь ({glucose?.night.date}) —{' '}
        <span
          className={(glucose?.night.value || 0) < 6
            ? styles.Red
            : (glucose?.night.value || 0) > 8
              ? styles.Orange
              : styles.Green}
        >
          {Math.round((glucose?.night.value || 0) * 10) / 10}
        </span>
      </h2>
    </div>
  );
};

export default GlucoseList;
