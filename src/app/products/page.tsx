import React from 'react';
import {getUrl} from "@/src/app/utils/common";
import styles from './styles.module.scss'
import ProductsList from "@/src/app/components/client/ProductsList";

const Products = async () => {
  const url = await getUrl()
  const responseProducts = await fetch(`${url}/api/products`, {method: 'GET'});
  const products = await responseProducts.json();

  return (
    <div className={styles.Products}>
      <h1>Продукты</h1>
      <ProductsList products={products}/>
    </div>
  );
};

export default Products;
