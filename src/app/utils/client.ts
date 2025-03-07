"use client"

import {Glucose} from "@/src/app/StoreProvider";
import moment from "moment/moment";
import {GlucoseHistory} from "@/src/app/api/libre/route";
import _isEqual from "lodash/isEqual";

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
      newNight.value = (yDayNight + (glucoseNow * 2)) / 3
    }
  }

  if (hours >= 20 && moment(glucose.day.date, 'DD.MM.YY').isBefore(moment(), 'day')) {
    const response = await fetch('/api/libre/', {method: 'POST'})
    glucoseHistory = await response.json()
    if (glucoseHistory) {
      newDay.date = moment().format('DD.MM.YY');
      const glucoseNow = glucoseHistory.data.periods[0].avgGlucose
      newDay.value = ((glucoseNow * 3) - newNight.value) / 2
      newYDayGlucose = glucoseNow
    }
  }

  const newGlucose = {yDayGlucose: newYDayGlucose, day: newDay, night: newNight}

  if (!_isEqual(glucose, newGlucose)) {
    await fetch(`/api/glucose`, {
      method: "PATCH",
      body: JSON.stringify(newGlucose),
      headers: {'Content-Type': 'application/json'}
    });
  }

  return newGlucose
}
