"use client"

import {Glucose, Product, Settings} from "@/src/app/Providers/StoreProvider";
import moment from "moment/moment";
import {GlucoseHistory} from "@/src/app/api/libre/route";
import * as XLSX from 'xlsx';

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

export const exportToExcel = async (data: { products: Product[], settings: { [x in keyof Settings]?: number } }) => {
  // Создаем новую книгу
  const wb = XLSX.utils.book_new();

  // Создаем данные для рабочего листа
  const products = [
    ['Название', 'ХЕ'],
    ...data.products.map(item => [item.name, item.value])
  ];
  const settings = [
    ['Длинный на день', data.settings.longMorning],
    ['Завтрак', data.settings.breakfast],
    ['Обед', data.settings.lunch],
    ['Ужин', data.settings.dinner],
    ['Длинный на ночь', data.settings.longEvening]
  ]

  // Преобразуем данные в рабочий лист
  const wsProducts = XLSX.utils.aoa_to_sheet(products);
  const wsSettings = XLSX.utils.aoa_to_sheet(settings);

  // Добавляем рабочий лист в книгу
  XLSX.utils.book_append_sheet(wb, wsProducts, "Продукты");
  XLSX.utils.book_append_sheet(wb, wsSettings, "Настройки");

  // Генерируем файл и инициируем скачивание
  XLSX.writeFile(wb, 'документ.xlsx');
}
