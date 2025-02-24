import React from 'react';
import {CircularProgress} from "@mui/material";
import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <CircularProgress className={styles.Loading}/>
  );
};

export default Loading;
