import React from 'react';
import styles from './styles.module.scss'
import RestaurantIcon from '@mui/icons-material/Restaurant';
import KitchenIcon from '@mui/icons-material/Kitchen';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from "next/link";

const Menu = () => {
  return (
    <div className={styles.Menu}>
      <Link href='/'><RestaurantIcon/></Link>
      <Link href='/products'><KitchenIcon/></Link>
      <Link href='/settings'><SettingsIcon/></Link>
    </div>
  );
};

export default Menu;
