"use client"

import React, {createContext, useContext, useState} from 'react';

export type Product = { name: string, value: number }
export type Settings = {
  "longMorning": number,
  "longEvening": number,
  "breakfast": number,
  "lunch": number,
  "dinner": number
}

type UseStoreProps = {
  settings: { [x in keyof Settings]?: number }
  setSettings: (settings: { [x in keyof Settings]?: number }) => void
  products: Product[]
  setProducts: (products: Product[]) => void
};

const StoreContext = createContext<UseStoreProps>({
  settings: {},
  setSettings: () => {
  },
  products: [],
  setProducts: () => {
  }
});

export const useStore = () => useContext(StoreContext);

type StoreProviderProps = {
  backSettings: Settings;
  backProducts: Product[];
  children: React.ReactNode;
}

const StoreProvider = ({backSettings, backProducts, children}: StoreProviderProps) => {
  const [settings, setSettings] = useState<Settings>(backSettings)
  const [products, setProducts] = useState<Product[]>(backProducts)

  return (
    <StoreContext.Provider value={{settings, setSettings, products, setProducts}}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
