import React from 'react';
import styles from './styles.module.scss'
import ProductsList from "@/src/app/components/client/ProductsList";

const Products = async () => {
  return (
    <div className={styles.Products}>
      <h1>Продукты</h1>
      <ProductsList/>
    </div>
  );
};

export default Products;
