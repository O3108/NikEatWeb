"use client"

import {Glucose, Product, Settings} from "@/src/app/Providers/StoreProvider";
import moment from "moment/moment";
import {GlucoseHistory} from "@/src/app/api/libre/route";
import * as XLSX from 'xlsx';

const SHEET_NAMES = {
  PRODUCTS: "Продукты",
  SETTINGS: "Настройки",
  GLUCOSE: "Глюкоза",
}

export const getGlucose = async (glucose: Glucose): Promise<Glucose> => {
  const newDay = glucose.day;
  const newNight = glucose.night
  let glucoseHistory: GlucoseHistory | null = null
  const hours = Number(moment().format('HH'))

  if (hours >= 10 && moment(glucose.night.date, 'DD.MM.YY').isBefore(moment(), 'day')) {
    const response = await fetch('/api/libre/', {method: 'POST'})
    glucoseHistory = await response.json()
    if (glucoseHistory) {
      newNight.date = moment().format('DD.MM.YY');
      const glucoseNow = glucoseHistory.data.periods[0].avgGlucose
      const yDayAll = glucoseHistory.data.periods[1].avgGlucose;
      const yDayCut = newDay.totalGlucose;
      const yDayNight = (yDayAll * 3) - (yDayCut * 2)
      const newNightValue = (yDayNight + (glucoseNow * 2)) / 3

      newNight.value = newNightValue;
      newNight.totalGlucose = glucoseNow;

      if (newNightValue > 8) {
        newNight.highCount += 1;
      } else {
        newNight.highCount = 0
      }

      if (newNightValue < 6) {
        newNight.lowCount += 1;
      } else {
        newNight.lowCount = 0;
      }
    }
  }

  if (hours >= 22 && moment(glucose.day.date, 'DD.MM.YY').isBefore(moment(), 'day')) {
    const response = await fetch('/api/libre/', {method: 'POST'})
    glucoseHistory = await response.json()
    if (glucoseHistory) {
      newDay.date = moment().format('DD.MM.YY');
      const glucoseNow = glucoseHistory.data.periods[0].avgGlucose
      const newDayValue = ((glucoseNow * 3) - newNight.totalGlucose) / 2

      newDay.value = newDayValue
      newDay.totalGlucose = glucoseNow

      if (newDayValue > 9) {
        newDay.highCount += 1
      } else {
        newDay.highCount = 0
      }

      if (newDayValue < 6) {
        newDay.lowCount += 1
      } else {
        newDay.lowCount = 0
      }
    }
  }

  const newGlucose = {day: newDay, night: newNight}

  if (glucoseHistory) {
    await fetch(`/api/glucose`, {
      method: "PATCH",
      body: JSON.stringify(newGlucose),
      headers: {'Content-Type': 'application/json'}
    });
  }

  return newGlucose
}

export const exportToExcel = async (data: {
  products: Product[],
  settings: { [x in keyof Settings]?: number },
  glucose: Glucose | null,
}) => {
  // Создаем новую книгу
  const wb = XLSX.utils.book_new();

  // Создаем данные для рабочего листа
  const products = [
    ['id', 'name', 'value'],
    ...data.products.map(item => [item.id, item.name, item.value])
  ];
  const settings = [
    ['id', 'id', data.settings.id],
    ['longMorning', 'Длинный на день', data.settings.longMorning],
    ['breakfast', 'Завтрак', data.settings.breakfast],
    ['lunch', 'Обед', data.settings.lunch],
    ['dinner', 'Ужин', data.settings.dinner],
    ['longEvening', 'Длинный на ночь', data.settings.longEvening]
  ]
  const glucose = [
    ...(data.glucose?.day ? Object.entries(data.glucose.day).map(item => ['day', ...item]) : []),
    ...(data.glucose?.night ? Object.entries(data.glucose.night).map(item => ['night', ...item]) : []),
  ]

  // Преобразуем данные в рабочий лист
  const wsProducts = XLSX.utils.aoa_to_sheet(products);
  const wsSettings = XLSX.utils.aoa_to_sheet(settings);
  const wsGlucose = XLSX.utils.aoa_to_sheet(glucose);

  // Установка ширины столбцов
  wsProducts['!cols'] = [
    {wch: 15}, {wch: 35}, {wch: 15}
  ];
  wsSettings['!cols'] = [
    {wch: 15}, {wch: 15}, {wch: 15}
  ];
  wsGlucose['!cols'] = [
    {wch: 35},
  ];

  // Добавляем рабочий лист в книгу
  XLSX.utils.book_append_sheet(wb, wsProducts, SHEET_NAMES.PRODUCTS);
  XLSX.utils.book_append_sheet(wb, wsSettings, SHEET_NAMES.SETTINGS);
  XLSX.utils.book_append_sheet(wb, wsGlucose, SHEET_NAMES.GLUCOSE);

  // Генерируем файл и инициируем скачивание
  XLSX.writeFile(wb, 'Nik-eat-backup.xlsx');
}

export const importFromExcel = (file: File, setData: (data: {
  products: Product[],
  glucose: Glucose,
  settings: Settings
}) => void) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = e.target?.result; // Получаем ArrayBuffer
    const workbook = XLSX.read(arrayBuffer, {type: 'array'}); // Указываем тип 'array'
    const productsWorksheet = workbook.Sheets[SHEET_NAMES.PRODUCTS];
    const settingsWorksheet = workbook.Sheets[SHEET_NAMES.SETTINGS];
    const glucoseWorksheet = workbook.Sheets[SHEET_NAMES.GLUCOSE];

    const products = XLSX.utils.sheet_to_json(productsWorksheet) as Product[];
    const settings = (XLSX.utils.sheet_to_json(settingsWorksheet, {header: 1}) as [string, string, number][]).reduce<{
      id: number,
      longMorning: number,
      longEvening: number,
      breakfast: number,
      lunch: number,
      dinner: number
    }>((acc, curr) => {
      return {...acc, [curr[0]]: curr[2]}
    }, {
      id: 0, longMorning: 0, longEvening: 0, breakfast: 0, lunch: 0,
      dinner: 0
    });
    const glucose = (XLSX.utils.sheet_to_json(glucoseWorksheet, {header: 1}) as ['day' | 'night', string, number | string][]).reduce<{
      day: {
        id: number,
        date: string,
        value: number,
        highCount: number,
        lowCount: number,
        totalGlucose: number
      },
      night: {
        id: number,
        date: string,
        value: number,
        highCount: number,
        lowCount: number,
        totalGlucose: number
      },
    }>((acc, curr) => {
      return {...acc, [curr[0]]: {...acc[curr[0]], [curr[1]]: curr[2]}}
    }, {
      day: {
        id: 0,
        date: '',
        value: 0,
        highCount: 0,
        lowCount: 0,
        totalGlucose: 0
      },
      night: {
        id: 0,
        date: '',
        value: 0,
        highCount: 0,
        lowCount: 0,
        totalGlucose: 0
      }
    });

    setData({products, settings, glucose})
  };

  reader.readAsArrayBuffer(file);
}
