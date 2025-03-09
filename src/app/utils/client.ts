"use client"

import {Glucose} from "@/src/app/Providers/StoreProvider";
import moment from "moment/moment";
import {GlucoseHistory} from "@/src/app/api/libre/route";

export const getGlucose = async (glucose: Glucose): Promise<Glucose> => {
  const newDay = glucose.day;
  const newNight = glucose.night
  let newYDayGlucose = glucose.yDayGlucose
  let glucoseHistory: GlucoseHistory | null = null
  const hours = Number(moment().format('HH'))

  if (hours >= 8 && moment(glucose.night.date, 'DD.MM.YY').isBefore(moment(), 'day')) {
    const response = await fetch('/api/libre/', {method: 'POST'})
    glucoseHistory = await response.json()
    if (glucoseHistory) {
      newNight.date = moment().format('DD.MM.YY');
      const glucoseNow = glucoseHistory.data.periods[0].avgGlucose
      const yDayAll = glucoseHistory.data.periods[1].avgGlucose;
      const yDayCut = glucose.yDayGlucose;
      const yDayNight = (yDayAll * 3) - (yDayCut * 2)
      const newNightValue = (yDayNight + (glucoseNow * 2)) / 3

      newNight.value = newNightValue;

      if (newNightValue > 8) {
        newNight.highCount += 1;
      }
      if (newNightValue < 6) {
        newNight.lowCount += 1;
      }
    }
  }

  if (hours >= 20 && moment(glucose.day.date, 'DD.MM.YY').isBefore(moment(), 'day')) {
    const response = await fetch('/api/libre/', {method: 'POST'})
    glucoseHistory = await response.json()
    if (glucoseHistory) {
      newDay.date = moment().format('DD.MM.YY');
      const glucoseNow = glucoseHistory.data.periods[0].avgGlucose
      const newDayValue = ((glucoseNow * 3) - newNight.value) / 2

      newDay.value = newDayValue
      newYDayGlucose = glucoseNow

      if (newDayValue > 10) {
        newDay.highCount += 1
      }
      if (newDayValue < 6) {
        newDay.lowCount += 1
      }
    }
  }

  const newGlucose = {yDayGlucose: newYDayGlucose, day: newDay, night: newNight}

  if (glucoseHistory) {
    await fetch(`/api/glucose`, {
      method: "PATCH",
      body: JSON.stringify(newGlucose),
      headers: {'Content-Type': 'application/json'}
    });
  }

  return newGlucose
}
