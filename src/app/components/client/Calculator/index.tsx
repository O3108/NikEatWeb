"use client"

import React, {useCallback, useRef, useState} from 'react';
import TextField from "@mui/material/TextField";
import _sortBy from 'lodash/sortBy'

import {Autocomplete, IconButton, MenuItem, Select} from "@mui/material";
import styles from './styles.module.scss'
import CloseIcon from '@mui/icons-material/Close';
import moment from "moment";
import {Product, Settings} from "@/src/app/page";
import {useStore} from "@/src/app/StoreProvider";

const Calculator = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {products, settings} = useStore()
  const [selectedProducts, setSelectedProducts] = useState<(Product & { count: number })[]>([]);

  const hours = Number(moment().format('HH'))

  const [selectedSettings, setSelectedSettings] = useState<keyof Settings>(hours > 6 && hours < 12 ? 'breakfast' : hours < 18 ? 'lunch' : 'dinner')

  const productsForOptions = _sortBy(products.filter(item => !selectedProducts.find(findItem => findItem.name === item.name), 'name'));
  const totalValue = selectedProducts.reduce((acc, curr) => {
    return acc += curr.value * curr.count * settings[selectedSettings]
  }, 0)

  const onChangeProduct = useCallback((product: (Product & { count: number }), productIndex: number) => {
    setSelectedProducts(selectedProducts.map((item, index) =>
      index === productIndex ? product : item))
  }, [selectedProducts])

  const onDeleteProduct = useCallback((productIndex: number) => {
    setSelectedProducts(selectedProducts.filter((item, index) => index !== productIndex))
  }, [selectedProducts]);

  return (
    <div className={styles.Calculator}>
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
              value={item.count ? item.count : ''}
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
      {!!totalValue && <h2>Нужно поставить {Math.ceil(totalValue * 10) / 10}</h2>}
    </div>
  );
};

export default Calculator;
