"use client"

import React, {useCallback, useState} from 'react';
import styles from './styles.module.scss'
import {Button, CircularProgress} from "@mui/material";
import TextField from "@mui/material/TextField";
import {Settings, useStore} from "@/src/app/Providers/StoreProvider";
import {useAlert} from "@/src/app/Providers/AlertProvider";

const SettingsList = () => {
  const {settings, setSettings} = useStore()
  const {setAlertData} = useAlert()
  const [newSettings, setNewSettings] = useState<{ [x in keyof Settings]?: number }>(settings)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onChangeSettings = useCallback((name: keyof Settings, value: number) => {
    setNewSettings({...newSettings, [name]: value})
  }, [])

  const getSettings = useCallback(async () => {
    const responseSettings = await fetch(`/api/settings`, {method: 'GET'})
    const settings: Settings | { error: string } = await responseSettings.json();

    if ('error' in settings) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      setAlertData({isShow: true, severity: 'success'})
      setSettings(settings)
      setNewSettings(settings)
    }
  }, [])

  const onSave = useCallback(async () => {
    setIsLoading(true)
    const response = await fetch(`/api/settings`, {
      method: "PATCH",
      body: JSON.stringify(newSettings),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();
    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      await getSettings()
    }
    setIsLoading(false)
  }, [newSettings, getSettings])

  return (
    <div className={styles.SettingsList}>
      <TextField
        label='Длинный на день'
        type='number'
        defaultValue={settings.longMorning}
        onChange={(e) =>
          onChangeSettings('longMorning', Number(e.target.value))}
      />
      <TextField
        label='Завтрак'
        type='number'
        defaultValue={settings.breakfast}
        onChange={(e) =>
          onChangeSettings('breakfast', Number(e.target.value))}
      />
      <TextField
        label='Обед'
        type='number'
        defaultValue={settings.lunch}
        onChange={(e) =>
          onChangeSettings('lunch', Number(e.target.value))}
      />
      <TextField
        label='Ужин'
        type='number'
        defaultValue={settings.dinner}
        onChange={(e) =>
          onChangeSettings('dinner', Number(e.target.value))}
      />
      <TextField
        label='Длинный на ночь'
        type='number'
        defaultValue={settings.longEvening}
        onChange={(e) =>
          onChangeSettings('longEvening', Number(e.target.value))}
      />
      <Button disabled={isLoading} onClick={onSave} variant='contained' className={styles.Button}>
        {isLoading ? <CircularProgress/> : 'Сохранить'}
      </Button>
    </div>
  );
};

export default SettingsList;
