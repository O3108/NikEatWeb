"use client"
import React, {createContext, ReactNode, useContext, useState} from 'react';
import Alert from "@/src/app/components/client/Alert";

type AlertProviderProps = {
  children: ReactNode;
}

type UseAlertProps = {
  setAlertData: (value: { isShow: boolean, severity: 'success' | 'error' }) => void
};

const AlertContext = createContext<UseAlertProps>({
  setAlertData: () => {
  }
});

export const useAlert = () => useContext(AlertContext);

const AlertProvider = ({children}: AlertProviderProps) => {
  const [alertData, setAlertData] = useState<{ isShow: boolean, severity: 'success' | 'error' }>({
    isShow: false,
    severity: 'success',
  })

  return (
    <AlertContext.Provider value={{setAlertData}}>
      <Alert
        severity={alertData.severity}
        isShow={alertData.isShow}
        setIsShow={(value) => setAlertData({...alertData, isShow: value})}
      >
        {alertData.severity === 'success' ? 'Сохранено' : 'Ошибка сохранения'}
      </Alert>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;
