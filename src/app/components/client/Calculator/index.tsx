"use client"

import React, {useCallback, useRef, useState} from 'react';
import TextField from "@mui/material/TextField";
import _sortBy from 'lodash/sortBy'

import {Autocomplete, Button, CircularProgress, IconButton, MenuItem, Select} from "@mui/material";
import styles from './styles.module.scss'
import CloseIcon from '@mui/icons-material/Close';
import moment from "moment";
import {ActiveInsulin, Product, Settings, useStore} from "@/src/app/Providers/StoreProvider";
import {useAlert} from "@/src/app/Providers/AlertProvider";

const ACTIVE_MINUTES = 120;
const ACTIVE_HOURS = 2

const Calculator = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {products, settings, activeInsulin, setActiveInsulin} = useStore()
  const {setAlertData} = useAlert()

  const hours = Number(moment().format('HH'))

  const [selectedSettings, setSelectedSettings] = useState<keyof Settings>(hours > 6 && hours < 12 ? 'breakfast' : hours < 18 ? 'lunch' : 'dinner')
  const [currentGlucose, setCurrentGlucose] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedProducts, setSelectedProducts] = useState<(Product & { count: number })[]>([]);

  const productsForOptions = _sortBy(products?.filter(item => !selectedProducts.find(findItem => findItem.name === item.name), 'name'));

  const lefTimeActiveInsulin =
    activeInsulin && moment().diff(moment(activeInsulin.date, 'DD.MM.YY HH:mm'), 'hours') < ACTIVE_HOURS
      ? ACTIVE_MINUTES - moment().diff(moment(activeInsulin.date, 'DD.MM.YY HH:mm'), 'minutes')
      : 0;

  const newActiveInsulin = lefTimeActiveInsulin && activeInsulin
    ? Math.round(activeInsulin.value / ACTIVE_MINUTES * lefTimeActiveInsulin * 10) / 10
    : 0

  const totalValue = Math.ceil(selectedProducts.reduce((acc, curr) => {
    if (settings?.[selectedSettings]) {
      return acc += curr.value * curr.count * settings[selectedSettings]
    } else {
      return acc
    }
  }, 0) + (currentGlucose ? (currentGlucose > 7 ? (currentGlucose - 7) / 3 : 0) - newActiveInsulin : 0))

  const totalXE = Math.round(selectedProducts.reduce((acc, curr) => {
    return acc += curr.value * curr.count;
  }, 0) * 10) / 10;

  const onChangeProduct = useCallback((product: (Product & { count: number }), productIndex: number) => {
    setSelectedProducts(selectedProducts.map((item, index) =>
      index === productIndex ? product : item))
  }, [selectedProducts])

  const onDeleteProduct = useCallback((productIndex: number) => {
    setSelectedProducts(selectedProducts.filter((item, index) => index !== productIndex))
  }, [selectedProducts]);

  const getActiveInsulin = useCallback(async () => {
    const responseActiveInsulin = await fetch(`/api/active-insulin`, {method: 'GET'})
    const activeInsulin: ActiveInsulin | { error: string } = await responseActiveInsulin.json();

    if ('error' in activeInsulin) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      setAlertData({isShow: true, severity: 'success'})
      setActiveInsulin(activeInsulin)
      setSelectedProducts([]);
      setCurrentGlucose(0)
    }
  }, [])

  const onSave = useCallback(async () => {
    setIsLoading(true)
    if (activeInsulin) {
      const newActiveInsulin = {id: activeInsulin.id, date: moment().format('DD.MM.YY HH:mm'), value: totalValue}
      localStorage.setItem('activeInsulin', JSON.stringify(newActiveInsulin));
      const response = await fetch(`/api/active-insulin`, {
        method: "PATCH",
        body: JSON.stringify(newActiveInsulin),
        headers: {'Content-Type': 'application/json'}
      });
      const res: { status: 'ok' } | { error: string } = await response.json();
      if ('error' in res) {
        setAlertData({isShow: true, severity: 'error'})
        setActiveInsulin(newActiveInsulin)
        setSelectedProducts([]);
        setCurrentGlucose(0)
      } else {
        await getActiveInsulin();
      }
    }
    setIsLoading(false)
  }, [activeInsulin, totalValue, getActiveInsulin])

  return (
    <div className={styles.Calculator}>
      <TextField
        className={styles.TextField}
        label='Сахар'
        value={currentGlucose || ''}
        type='number'
        onChange={(e) =>
          setCurrentGlucose(Number(e.target.value))}
      />
      Активный инсулин {newActiveInsulin}
      <Select
        value={selectedSettings}
        onChange={(e) =>
          setSelectedSettings(e.target.value as keyof Settings)}
      >
        <MenuItem value='breakfast'>Завтрак</MenuItem>
        <MenuItem value='lunch'>Обед</MenuItem>
        <MenuItem value='dinner'>Ужин</MenuItem>
      </Select>
      <Autocomplete
        blurOnSelect
        disablePortal
        options={productsForOptions}
        getOptionLabel={(value) => value.name}
        value={null}
        onChange={(e, value: Product | null) => {
          if (value) {
            setSelectedProducts([...selectedProducts, {...value, count: 1}])
            inputRef.current?.blur();
          }
        }}
        renderInput={(params) => <TextField {...params} label="Продукты"/>}
      />
      <div className={styles.Products}>
        {selectedProducts.map((item, index) => (
          <div key={index} className={styles.Product}>
            <TextField
              className={styles.TextField}
              label={item.name}
              value={item.count || ''}
              type='number'
              slotProps={{
                input: {
                  endAdornment:
                    <IconButton onClick={() => onDeleteProduct(index)}>
                      <CloseIcon/>
                    </IconButton>
                }
              }}
              onChange={(e) =>
                onChangeProduct({...item, count: Number(e.target.value)}, index)}
            />
          </div>
        ))}
      </div>

      <Button
        disabled={isLoading || !totalValue || totalValue < 0}
        onClick={onSave} variant='contained'
        className={styles.Button}
      >
        {isLoading
          ? <CircularProgress/>
          : (!!totalValue || !!currentGlucose) &&
          totalValue > 0
            ?
            <>
              {!!totalXE && <>На <b>{totalXE} ХЕ</b></>} Нужно
              поставить <b>{totalValue > 0 ? totalValue : 0}</b>
            </>
            :
            <>
              Не нужно ставить
            </>
        }
      </Button>
    </div>
  );
};

export default Calculator;
