"use client"

import React, {createContext, useContext, useEffect, useState} from 'react';
import {getGlucose} from "@/src/app/utils/client";
import Loading from "@/src/app/loading";

export type Product = { name: string, value: number, id: number }
export type Settings = {
  "id": number;
  "longMorning": number,
  "longEvening": number,
  "breakfast": number,
  "lunch": number,
  "dinner": number
}
export type Glucose = {
  day: {
    id: number;
    date: string;
    value: number;
    highCount: number;
    lowCount: number;
    totalGlucose: number;
  },
  night: {
    id: number;
    date: string;
    value: number;
    highCount: number;
    lowCount: number;
    totalGlucose: number;
  }
}

export type ActiveInsulin = {
  id: number;
  date: string;
  value: number;
}

type UseStoreProps = {
  settings: { [x in keyof Settings]?: number } | null
  setSettings: (settings: { [x in keyof Settings]?: number }) => void
  products: Product[] | null
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
  children: React.ReactNode;
}

const StoreProvider = ({children}: StoreProviderProps) => {
  const [settings, setSettings] = useState<{ [x in keyof Settings]?: number } | null>(null)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [glucose, setGlucose] = useState<Glucose | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const [responseProducts, responseSettings, responseAvgGlucose] = await Promise.all(
        [
          fetch(`/api/products`, {method: 'GET'}),
          fetch(`/api/settings`, {method: 'GET'}),
          fetch(`/api/glucose`, {method: 'GET'}),
        ]
      );

      const products: Product[] | { error: string } = await responseProducts.json();
      const settings: Settings | { error: string } = await responseSettings.json();
      const glucose: Glucose | { error: string } = await responseAvgGlucose.json()

      if (!('error' in products)) {
        setProducts(products);
      }
      if (!('error' in settings)) {
        setSettings(settings);
      }
      if (!('error' in glucose)) {
        const response = await getGlucose(glucose)
        setGlucose(response)
      }
      setIsLoading(false)
    }

    getData();
  }, []);

  if (isLoading) return <Loading/>

  return (
    <StoreContext.Provider value={{settings, setSettings, products, setProducts, glucose, setGlucose}}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
