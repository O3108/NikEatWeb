"use client"

import React, {useCallback, useState} from 'react';
import styles from './styles.module.scss'
import {Glucose, useStore} from "@/src/app/Providers/StoreProvider";
import ClearIcon from '@mui/icons-material/Clear';
import {CircularProgress, IconButton} from "@mui/material";
import {useAlert} from "@/src/app/Providers/AlertProvider";

const GlucoseList = () => {
  const {glucose, setGlucose, isAccessEdit} = useStore()
  const {setAlertData} = useAlert()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getGlucose = useCallback(async () => {
    const responseGlucose = await fetch(`/api/glucose`, {method: 'GET'})
    const glucose: Glucose | { error: string } = await responseGlucose.json();
    if ('error' in glucose) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      setAlertData({isShow: true, severity: 'success'})
      setGlucose(glucose)
    }
  }, [])

  const onEditGlucose = useCallback(async (value: Glucose) => {
    setIsLoading(true)
    const response = await fetch(`/api/glucose`, {
      method: "PATCH",
      body: JSON.stringify(value),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();
    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      await getGlucose()
    }
    setIsLoading(false)
  }, [])

  return (
    <div className={styles.GlucoseList}>
      <h2>Средний день ({glucose?.day.date}) —{' '}
        <span
          className={(glucose?.day.value || 0) < 6
            ? styles.Red
            : (glucose?.day.value || 0) > 9
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
          disabled={!isAccessEdit}
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
          disabled={!isAccessEdit}
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
          disabled={!isAccessEdit}
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
          disabled={!isAccessEdit}
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
