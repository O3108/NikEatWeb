"use client"

import React, {useCallback, useState} from 'react';
import TextField from "@mui/material/TextField";
import {Button} from "@mui/material";
import styles from './styles.module.scss'
import _sortBy from "lodash/sortBy";
import {Product} from "@/src/app/page";

type ProductsListProps = {
  products: Product[]
}

const ProductsList = ({products}: ProductsListProps) => {
  const [newProducts, setNewProducts] = useState<Product[]>(products ? _sortBy(products, "name") as (Product[]) : [])

  const onChangeProduct = useCallback((product: Product, productIndex: number) => {
    setNewProducts(newProducts.map((item, index) => index === productIndex ? product : item))
  }, [newProducts])

  const onSave = useCallback(async () => {
    const response = await fetch(`/api/products-test`, {
      method: "GET"
    });
    const res = await response.json();
    console.log('aaa', res)

  }, [newProducts])

  return (
    <div className={styles.ProductsList}>
      <div className={styles.Products}>
        {products.map((item, index) => (
          <div key={index} className={styles.Product}>
            <TextField
              label='Название'
              defaultValue={item.name}
              onChange={(e) =>
                onChangeProduct({...item, name: e.target.value}, index)
              }
            />
            <TextField
              label='ХЕ'
              type='number'
              defaultValue={item.value}
              onChange={(e) =>
                onChangeProduct({...item, value: Number(e.target.value)}, index)
              }
            />
          </div>
        ))}
      </div>
      <Button onClick={onSave}>Сохранить</Button>
    </div>
  );
};

export default ProductsList;
