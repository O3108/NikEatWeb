import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Glucose} from "@/src/app/Providers/StoreProvider";
import moment from "moment-timezone";
import {GLUCOSE_THRESHOLDS} from "@/src/app/constants/glucose";
import {fetchGlucoseHistory, type GlucoseHistory} from "@/src/app/utils/libre";

type SERVER_GLUCOSE = Record<"id" | "period" | "date" | "high_count" | "low_count" | "value" | "total_glucose", number |
  string | Date>[]

export const POST = async (req: Request) => {
  try {
    // Проверяем наличие переменных окружения
    if (!process.env.LIBRE_EMAIL || !process.env.LIBRE_PASSWORD) {
      console.error('Missing LibreView credentials in environment variables');
      return NextResponse.json(
        {error: 'LibreView credentials not configured. Please add LIBRE_EMAIL and LIBRE_PASSWORD to .env.development.local'},
        {status: 500}
      );
    }

    const glucose: Glucose = await req.json();

    const newDay = glucose.day;
    const newNight = glucose.night;
    const newAllDay = glucose.allDay;
    let glucoseHistory: GlucoseHistory | null = null;

    // Используем московское время (UTC+5)
    const now = moment.tz('Asia/Yekaterinburg');
    const hours = Number(now.format('HH'));

    console.log('Current time (Yekaterinburg):', now.format('DD.MM.YY HH:mm'));
    console.log('Current hour:', hours);
    console.log('Night date:', glucose.night.date);
    console.log('Day date:', glucose.day.date);

    // Единая ленивая загрузка истории глюкозы из LibreView (кэшируется на один вызов)
    const getGlucoseHistory = async (): Promise<GlucoseHistory | null> => {
      if (glucoseHistory) return glucoseHistory;
      try {
        glucoseHistory = await fetchGlucoseHistory();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('LibreView glucose history fetch failed:', message);
        glucoseHistory = null;
      }
      return glucoseHistory;
    };

    // Обновление ночных данных (после 10:00)
    if (hours >= 10 && moment(glucose.night.date, 'DD.MM.YY').isBefore(now, 'day')) {
      console.log('Updating night glucose data...');
      glucoseHistory = await getGlucoseHistory();

      if (glucoseHistory) {
        newNight.date = now.format('DD.MM.YY');
        const glucoseNow = glucoseHistory.data.periods[0].avgGlucose;
        const yDayAll = glucoseHistory.data.periods[1].avgGlucose;
        const yDayCut = newDay.totalGlucose;
        const yDayNight = (yDayAll * 3) - (yDayCut * 2);
        const newNightValue = (yDayNight + (glucoseNow * 2)) / 3;

        newNight.value = newNightValue;
        newNight.totalGlucose = glucoseNow;

        if (newNightValue > GLUCOSE_THRESHOLDS.HIGH_NIGHT) {
          newNight.highCount += 1;
        } else {
          newNight.highCount = 0;
        }

        if (newNightValue < GLUCOSE_THRESHOLDS.LOW) {
          newNight.lowCount += 1;
        } else {
          newNight.lowCount = 0;
        }
      }
    }

    // Обновление дневных данных (после 22:00)
    if (hours >= 22 && moment(glucose.day.date, 'DD.MM.YY').isBefore(now, 'day')) {
      console.log('Updating day glucose data...');
      // Если данные еще не получены, получаем их
      if (!glucoseHistory) {
        glucoseHistory = await getGlucoseHistory();
      }

      if (glucoseHistory) {
        newDay.date = now.format('DD.MM.YY');
        const glucoseNow = glucoseHistory.data.periods[0].avgGlucose;
        const newDayValue = ((glucoseNow * 3) - newNight.totalGlucose) / 2;

        newDay.value = newDayValue;
        newDay.totalGlucose = glucoseNow;

        if (newDayValue > GLUCOSE_THRESHOLDS.HIGH_DAY) {
          newDay.highCount += 1;
        } else {
          newDay.highCount = 0;
        }

        if (newDayValue < GLUCOSE_THRESHOLDS.LOW) {
          newDay.lowCount += 1;
        } else {
          newDay.lowCount = 0;
        }
      }
    }

    // Обновление суточных данных
    if (moment(glucose.allDay.date, 'DD.MM.YY').isBefore(now, 'day')) {
      console.log('Updating allDay glucose data...');
      // Если данные еще не получены, получаем их
      if (!glucoseHistory) {
        glucoseHistory = await getGlucoseHistory();
      }

      if (glucoseHistory) {
        newAllDay.date = now.format('DD.MM.YY');
        const newAllDayValue = glucoseHistory.data.periods[1].avgGlucose;

        newAllDay.value = newAllDayValue;
        newAllDay.totalGlucose = newAllDayValue;

        if (newAllDayValue > GLUCOSE_THRESHOLDS.HIGH_ALL_DAY) {
          newAllDay.highCount += 1;
        } else {
          newAllDay.highCount = 0;
        }

        if (newAllDayValue < GLUCOSE_THRESHOLDS.LOW) {
          newAllDay.lowCount += 1;
        } else {
          newAllDay.lowCount = 0;
        }
      }
    }

    const newGlucose = {day: newDay, night: newNight, allDay: newAllDay};

    // Сохраняем обновленные данные в БД, если были изменения
    if (glucoseHistory) {
      console.log('Saving glucose data to database...');
      const sql = neon(`${process.env.DATABASE_URL}`);

      // Используем параметризованные запросы для защиты от SQL-инъекций
      await sql(
        'UPDATE glucose SET period = $1, date = $2, high_count = $3, low_count = $4, value = $5, total_glucose = $6 WHERE id = $7',
        ['day', newGlucose.day.date, newGlucose.day.highCount, newGlucose.day.lowCount, newGlucose.day.value, newGlucose.day.totalGlucose, newGlucose.day.id]
      );

      await sql(
        'UPDATE glucose SET period = $1, date = $2, high_count = $3, low_count = $4, value = $5, total_glucose = $6 WHERE id = $7',
        ['night', newGlucose.night.date, newGlucose.night.highCount, newGlucose.night.lowCount, newGlucose.night.value, newGlucose.night.totalGlucose, newGlucose.night.id]
      );

      await sql(
        'UPDATE glucose SET period = $1, date = $2, high_count = $3, low_count = $4, value = $5, total_glucose = $6 WHERE id = $7',
        ['allDay', newGlucose.allDay.date, newGlucose.allDay.highCount, newGlucose.allDay.lowCount, newGlucose.allDay.value, newGlucose.allDay.totalGlucose, newGlucose.allDay.id]
      );

      console.log('Database updated successfully');
    } else {
      console.log('No glucose history fetched, returning original data');
    }

    console.log('Returning glucose data:', newGlucose);
    return NextResponse.json(newGlucose);
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
