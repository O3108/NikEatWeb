"use client"

import React, {useCallback, useState} from 'react';
import styles from './styles.module.scss'
import {Glucose, useStore} from "@/src/app/Providers/StoreProvider";
import ClearIcon from '@mui/icons-material/Clear';
import {CircularProgress, IconButton} from "@mui/material";
import {useAlert} from "@/src/app/Providers/AlertProvider";

const GlucoseList = () => {
  const {glucose, setGlucose} = useStore()
  const {setAlertData} = useAlert()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onEditGlucose = useCallback(async (value: Glucose) => {
    setIsLoading(true)
    const response = await fetch(`/api/glucose`, {
      method: "POST",
      body: JSON.stringify(value),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();
    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      setAlertData({isShow: true, severity: 'success'})
      setGlucose(value)
    }
    setIsLoading(false)
  }, [])

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
      <h2 className={styles.ButtonItem}>
        Высоких дней — {glucose?.day.highCount}
        <IconButton
          onClick={() =>
            glucose && onEditGlucose({...glucose, day: {...glucose.day, highCount: 0}})
          }
        >
          {isLoading ? <CircularProgress size={24}/> : <ClearIcon/>}
        </IconButton>
      </h2>
      <h2 className={styles.ButtonItem}>
        Низких дней — {glucose?.day.lowCount}
        <IconButton
          onClick={() =>
            glucose && onEditGlucose({...glucose, day: {...glucose.day, lowCount: 0}})
          }
        >
          {isLoading ? <CircularProgress size={24}/> : <ClearIcon/>}
        </IconButton>
      </h2>
      <h2 className={styles.ButtonItem}>
        Высоких ночей — {glucose?.night.highCount}
        <IconButton
          onClick={() =>
            glucose && onEditGlucose({...glucose, night: {...glucose.night, highCount: 0}})
          }
        >
          {isLoading ? <CircularProgress size={24}/> : <ClearIcon/>}
        </IconButton>
      </h2>
      <h2 className={styles.ButtonItem}>
        Низких ночей — {glucose?.night.lowCount}
        <IconButton
          onClick={() =>
            glucose && onEditGlucose({...glucose, night: {...glucose.night, lowCount: 0}})
          }
        >
          {isLoading ? <CircularProgress size={24}/> : <ClearIcon/>}
        </IconButton>
      </h2>
    </div>
  );
};

export default GlucoseList;
