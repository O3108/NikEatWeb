"use client"

import React, {useCallback, useState} from 'react';
import TextField from "@mui/material/TextField";
import {Button, CircularProgress, IconButton} from "@mui/material";
import styles from './styles.module.scss'
import CloseIcon from '@mui/icons-material/Close';
import PlusIcon from '@mui/icons-material/Add';
import {Product, useStore} from "@/src/app/Providers/StoreProvider";
import {useAlert} from "@/src/app/Providers/AlertProvider";
import {exportToExcel} from "@/src/app/utils/client";

const ProductsList = () => {
  const {products, setProducts, settings, glucose, isAccessEdit} = useStore()
  const {setAlertData} = useAlert()
  const [editProducts, setEditProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({name: '', value: 0})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getProducts = useCallback(async () => {
    const responseProducts = await fetch(`/api/products`, {method: 'GET'})
    const products: Product[] | { error: string } = await responseProducts.json();
    if ('error' in products) {
      setAlertData({isShow: true, severity: 'error'})

      return null;
    } else {
      setAlertData({isShow: true, severity: 'success'})
      setProducts(products)

      return products
    }
  }, [])

  const onChangeProduct = useCallback((product: Product) => {
    const tempNewProducts = editProducts.filter(item => item.id !== product.id)
    setEditProducts([...tempNewProducts, product])
  }, [editProducts])

  const onSave = useCallback(async () => {
    setIsLoading(true)
    const response = await fetch(`/api/products`, {
      method: "PATCH",
      body: JSON.stringify(editProducts),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();

    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      const responseProducts = await getProducts()
      setEditProducts([]);

      if (responseProducts && settings) {
        await exportToExcel({products: responseProducts, settings, glucose})
      }
    }
    setIsLoading(false)
  }, [editProducts, getProducts, settings])

  const onDelete = useCallback(async (value: Product) => {
    setIsLoading(true)
    const response = await fetch(`/api/products`, {
      method: "DELETE",
      body: JSON.stringify(value),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();

    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      await getProducts()
    }
    setIsLoading(false)
  }, [products, getProducts])

  const onAdd = useCallback(async () => {
    setIsLoading(true)
    const response = await fetch(`/api/products`, {
      method: "PUT",
      body: JSON.stringify(newProduct),
      headers: {'Content-Type': 'application/json'}
    });
    const res: { status: 'ok' } | { error: string } = await response.json();

    if ('error' in res) {
      setAlertData({isShow: true, severity: 'error'})
    } else {
      await getProducts()
      setNewProduct({name: '', value: 0})
    }
    setIsLoading(false)
  }, [newProduct, getProducts])

  return (
    <div className={styles.ProductsList}>
      <div className={styles.Products}>
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
          <IconButton disabled={isLoading || !isAccessEdit} onClick={onAdd}>{isLoading ? <CircularProgress size={24}/> :
            <PlusIcon/>}</IconButton>
        </div>
        {products?.map((item, index) => (
          <div key={index} className={styles.Product}>
            <TextField
              className={styles.ProductName}
              label='Название'
              defaultValue={item.name}
              onChange={(e) =>
                onChangeProduct({...item, name: e.target.value})
              }
            />
            <TextField
              className={styles.ProductValue}
              label='ХЕ'
              type='number'
              defaultValue={item.value}
              onChange={(e) =>
                onChangeProduct({...item, value: Number(e.target.value)})
              }
            />
            <IconButton disabled={isLoading || !isAccessEdit} onClick={() => onDelete(item)}>
              {isLoading ? <CircularProgress size={24}/> : <CloseIcon/>}
            </IconButton>
          </div>
        ))}
      </div>
      <Button disabled={isLoading || !isAccessEdit} onClick={onSave} className={styles.Button} variant='contained'>
        {isLoading ? <CircularProgress/> : 'Сохранить'}
      </Button>
    </div>
  );
};

export default ProductsList;
