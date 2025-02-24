import React from 'react';
import styles from './styles.module.scss'
import SettingsList from "@/src/app/components/client/SettingsList";

const Settings = async () => {
  return (
    <div className={styles.Settings}>
      <h1>Настройки</h1>
      <SettingsList/>
    </div>
  );
};

export default Settings;
