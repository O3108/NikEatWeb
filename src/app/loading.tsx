import React from 'react';
import {CircularProgress} from "@mui/material";
import logoIcon from '@/src/app/icon.svg'
import styles from "./loading.module.scss";
import Image from "next/image";

const Loading = () => {
  return (
    <div className={styles.Loading}>
      <CircularProgress size={150}/>
      <Image src={logoIcon} alt='logo' width={100} height={100} className={styles.Logo}/>
    </div>
  );
};

export default Loading;
