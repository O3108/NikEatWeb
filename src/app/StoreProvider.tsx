"use client"

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {getGlucose} from "@/src/app/utils/client";

export type Product = { name: string, value: number }
export type Settings = {
  "longMorning": number,
  "longEvening": number,
  "breakfast": number,
  "lunch": number,
  "dinner": number
}
export type Glucose = {
  yDayGlucose: number
  day: {
    date: string;
    value: number;
  },
  night: {
    date: string;
    value: number;
  }
}

type UseStoreProps = {
  settings: { [x in keyof Settings]?: number }
  setSettings: (settings: { [x in keyof Settings]?: number }) => void
  products: Product[]
  setProducts: (products: Product[]) => void
  glucose: Glucose | null,
  setGlucose: (value: Glucose) => void
};

const StoreContext = createContext<UseStoreProps>({
  settings: {},
  setSettings: () => {
  },
  products: [],
  setProducts: () => {
  },
  glucose: null,
  setGlucose: () => {
  }
});

export const useStore = () => useContext(StoreContext);

type StoreProviderProps = {
  backSettings: Settings;
  backProducts: Product[];
  backGlucose: Glucose;
  children: React.ReactNode;
}

const StoreProvider = ({backSettings, backProducts, backGlucose, children}: StoreProviderProps) => {
  const [settings, setSettings] = useState<{ [x in keyof Settings]?: number }>(backSettings)
  const [products, setProducts] = useState<Product[]>(backProducts)
  const [glucose, setGlucose] = useState<Glucose>(backGlucose)

  const onGetGlucose = useCallback(async () => {
    const response = await getGlucose(glucose)
    setGlucose(response)
  }, [glucose])

  useEffect(() => {
    onGetGlucose()
  }, []);

  return (
    <StoreContext.Provider value={{settings, setSettings, products, setProducts, glucose, setGlucose}}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
