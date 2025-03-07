"use client"

import React, {useCallback, useState} from 'react';
import TextField from "@mui/material/TextField";
import {Button, CircularProgress, IconButton} from "@mui/material";
import styles from './styles.module.scss'
import _sortBy from "lodash/sortBy";
import CloseIcon from '@mui/icons-material/Close';
import PlusIcon from '@mui/icons-material/Add';
import Alert from "@/src/app/components/client/Alert";
import {Product, useStore} from "@/src/app/StoreProvider";

const ProductsList = () => {
  const {products, setProducts} = useStore()
  const [newProducts, setNewProducts] = useState<Product[]>(_sortBy(products, "name"))
  const [newProduct, setNewProduct] = useState<Product>({name: '', value: 0})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [alertData, setAlertData] = useState<{ isShow: boolean, severity: 'success' | 'error' }>({
    isShow: false,
    severity: 'success',
  })

  const onChangeProduct = useCallback((product: Product, productIndex: number) => {
    setNewProducts(newProducts.map((item, index) => index === productIndex ? product : item))
  }, [newProducts])

  const onDeleteProduct = useCallback(async (productIndex: number) => {
    const tempProducts = newProducts.filter((item, index) => index !== productIndex)
    await onSave(tempProducts, () => {
      setNewProducts(tempProducts);
    })
  }, [newProducts])

  const onAddProduct = useCallback(async () => {
    const tempProducts = [...newProducts, newProduct]
    await onSave(tempProducts, () => {
      setNewProducts(tempProducts)
      setNewProduct({name: '', value: 0})
    });
  }, [newProduct, newProducts])

  const onSave = useCallback(async (value: Product[], callback?: () => void) => {
    setIsLoading(true)
    const response = await fetch(`/api/products`, {
      method: "PATCH",
      body: JSON.stringify(value),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();
    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      setAlertData({isShow: true, severity: 'success'})
      setProducts(value)
      callback && callback()
    }
    setIsLoading(false)
  }, [])

  return (
    <div className={styles.ProductsList}>
      <Alert
        severity={alertData.severity}
        isShow={alertData.isShow}
        setIsShow={(value) => setAlertData({...alertData, isShow: value})}
      >
        {alertData.severity === 'success' ? 'Сохранено' : 'Ошибка сохранения'}
      </Alert>

      <div className={styles.Products}>
        {newProducts.map((item, index) => (
          <div key={index} className={styles.Product}>
            <TextField
              className={styles.ProductName}
              label='Название'
              defaultValue={item.name}
              onChange={(e) =>
                onChangeProduct({...item, name: e.target.value}, index)
              }
            />
            <TextField
              className={styles.ProductValue}
              label='ХЕ'
              type='number'
              defaultValue={item.value}
              onChange={(e) =>
                onChangeProduct({...item, value: Number(e.target.value)}, index)
              }
            />
            <IconButton disabled={isLoading} onClick={() => onDeleteProduct(index)}>
              {isLoading ? <CircularProgress size={24}/> : <CloseIcon/>}
            </IconButton>
          </div>
        ))}
        <div className={styles.Product}>
          <TextField
            className={styles.ProductName}
            label='Название'
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({...newProduct, name: e.target.value})
            }
          />
          <TextField
            className={styles.ProductValue}
            label='ХЕ'
            type='number'
            value={newProduct.value || ''}
            onChange={(e) =>
              setNewProduct({...newProduct, value: Number(e.target.value)})
            }
          />
          <IconButton onClick={onAddProduct}>{isLoading ? <CircularProgress size={24}/> : <PlusIcon/>}</IconButton>
        </div>
      </div>
      <Button disabled={isLoading} onClick={() => onSave(newProducts)} className={styles.Button} variant='contained'>
        {isLoading ? <CircularProgress/> : 'Сохранить'}
      </Button>
    </div>
  );
};

export default ProductsList;
