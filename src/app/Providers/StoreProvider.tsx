"use client"

import React, {createContext, useContext, useEffect, useState} from 'react';
import Loading from "@/src/app/loading";
import ImportFile from "@/src/app/components/client/ImportFile";
import moment from "moment";

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
  setGlucose: (value: Glucose) => void,
  activeInsulin: ActiveInsulin | null,
  setActiveInsulin: (value: ActiveInsulin) => void,
  isAccessEdit: boolean,
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
  },
  activeInsulin: null,
  setActiveInsulin: () => {
  },
  isAccessEdit: true,
});

export const useStore = () => useContext(StoreContext);

type StoreProviderProps = {
  children: React.ReactNode;
}

const StoreProvider = ({children}: StoreProviderProps) => {
  const [settings, setSettings] = useState<{ [x in keyof Settings]?: number } | null>(null)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [glucose, setGlucose] = useState<Glucose | null>(null)
  const [activeInsulin, setActiveInsulin] = useState<ActiveInsulin | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAccessEdit, setIsAccessEdit] = useState<boolean>(true)
  const [controller, setController] = useState<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    setController(abortController);

    const getData = async () => {
      setIsLoading(true);
      try {
        const [responseProducts, responseSettings, responseAvgGlucose, responseActiveInsulin] = await Promise.all(
          [
            fetch(`/api/products`, {method: 'GET', signal: abortController.signal}),
            fetch(`/api/settings`, {method: 'GET', signal: abortController.signal}),
            fetch(`/api/glucose`, {method: 'GET', signal: abortController.signal}),
            fetch(`/api/active-insulin`, {method: 'GET', signal: abortController.signal}),
          ]
        );

        const products: Product[] | { error: string } = await responseProducts.json();
        const settings: Settings | { error: string } = await responseSettings.json();
        const glucose: Glucose | { error: string } = await responseAvgGlucose.json();
        const activeInsulin: ActiveInsulin | { error: string } = await responseActiveInsulin.json()
        const localeActiveInsuline = JSON.parse(localStorage.getItem('activeInsulin') || 'null') as ActiveInsulin | null;

        if (!('error' in products)) {
          setProducts(products);
        }
        if (!('error' in settings)) {
          setSettings(settings);
        }
        if (!('error' in glucose)) {
          const calculateResponse = await fetch('/api/glucose/calculate', {
            method: 'POST',
            body: JSON.stringify(glucose),
            headers: {'Content-Type': 'application/json'},
            signal: abortController.signal
          });
          const calculatedGlucose: Glucose = await calculateResponse.json();
          setGlucose(calculatedGlucose);
        }
        if (!('error' in activeInsulin)) {
          if (localeActiveInsuline && moment(localeActiveInsuline.date, 'DD.MM.YY HH:mm').isAfter(moment(activeInsulin.date, 'DD.MM.YY HH:mm'))) {
            setActiveInsulin(localeActiveInsuline)
          } else {
            setActiveInsulin(activeInsulin);
          }
        }
      } catch (e) {
        if (!abortController.signal.aborted) {
          setIsAccessEdit(false)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    getData();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <StoreContext.Provider
      value={{
        settings,
        setSettings,
        products,
        setProducts,
        glucose,
        setGlucose,
        activeInsulin,
        setActiveInsulin,
        isAccessEdit
      }}>
      {isLoading && <Loading/>}
      {isLoading && controller && <ImportFile controller={controller}/>}
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
