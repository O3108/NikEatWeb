"use client"

import React, {useEffect} from 'react';
import {Alert as AlertMui} from "@mui/material";
import styles from "./styles.module.scss";

type AlertProps = {
  severity: "success" | "info" | "warning" | "error"
  children: React.ReactNode;
  isShow: boolean;
  setIsShow: (value: boolean) => void;
}

const Alert = ({children, severity, isShow, setIsShow}: AlertProps) => {

  useEffect(() => {
    if (isShow) {
      const timeId = setTimeout(() => {
        setIsShow(false)
      }, 3000)

      return () => {
        clearTimeout(timeId)
      }
    }
  }, [isShow]);

  if (!isShow) return null;

  return (
    <AlertMui className={styles.Alert} severity={severity}>
      {children}
    </AlertMui>
  );
};

export default Alert;
