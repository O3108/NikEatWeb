"use client"

import React, {useCallback, useRef, useState} from 'react';
import TextField from "@mui/material/TextField";
import _sortBy from 'lodash/sortBy'

import {Autocomplete, IconButton} from "@mui/material";
import styles from './styles.module.scss'
import CloseIcon from '@mui/icons-material/Close';
import moment from "moment";
import {Product, Settings} from "@/src/app/page";

type CalculatorProps = {
  products: Product[]
  settings: Settings
}

const Calculator = ({products, settings}: CalculatorProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<(Product & { count: number })[]>([]);

  const productsForOptions = _sortBy(products.filter(item => !selectedProducts.find(findItem => findItem.name === item.name), 'name'));
  const hours = Number(moment().format('HH'))
  const selectedSettings = hours > 6 && hours < 12 ? settings.breakfast : hours < 18 ? settings.lunch : settings.dinner;
  const totalValue = selectedProducts.reduce((acc, curr) => {
    return acc += curr.value * curr.count * selectedSettings
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
      <Autocomplete
        disablePortal
        options={productsForOptions}
        getOptionLabel={(value) => value.name}
        sx={{width: 300}}
        value={null}
        onChange={(e, value: Product | null) => {
          if (value) {
            setSelectedProducts([...selectedProducts, {...value, count: 1}])
          }
        }}
        renderInput={(params) => <TextField {...params} ref={inputRef} label="Продукты"/>}
      />
      <div className={styles.Products}>
        {selectedProducts.map((item, index) => (
          <div key={index} className={styles.Product}>
            <TextField
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
      {!!totalValue && <div className={styles.totalValue}>{Math.ceil(totalValue)}</div>}
    </div>
  );
};

export default Calculator;
