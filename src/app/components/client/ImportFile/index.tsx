import React, {useCallback} from 'react';
import {importFromExcel} from "@/src/app/utils/client";
import styles from './styles.module.scss'
import {Button} from "@mui/material";
import {useStore} from "@/src/app/Providers/StoreProvider";

type ImportFileProps = {
  controller: AbortController
}

const ImportFile = ({controller}: ImportFileProps) => {
  const {setSettings, setGlucose, setProducts, setActiveInsulin} = useStore()

  const getDataFromFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      importFromExcel(e.target.files[0], (data) => {
        if (data) {
          setProducts(data.products);
          setGlucose(data.glucose);
          setSettings(data.settings);
          controller.abort();
        }
      })
      const activeInsuline = localStorage.getItem('activeInsulin');
      if (activeInsuline) {
        setActiveInsulin(JSON.parse(activeInsuline))
      }

    }
  }, [])

  return (
    <div className={styles.ImportFile}>
      <Button className={styles.Button} variant='contained' component="label">
        Загрузить файл с данными
        <input
          type="file"
          hidden
          accept=".xlsx, .xls"
          onChange={getDataFromFile}
        />
      </Button>
    </div>
  );
};

export default ImportFile;
