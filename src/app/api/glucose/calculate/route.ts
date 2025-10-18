import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Glucose} from "@/src/app/Providers/StoreProvider";
import moment from "moment-timezone";

type GlucoseHistory = {
  "status": number,
  "data": {
    "periods": [
      {
        "avgGlucose": number,
      },
      {
        "avgGlucose": number,
      }
    ]
  }
}

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
    let glucoseHistory: GlucoseHistory | null = null;
    
    // Используем московское время (UTC+5)
    const now = moment.tz('Asia/Yekaterinburg');
    const hours = Number(now.format('HH'));
    
    console.log('Current time (Yekaterinburg):', now.format('DD.MM.YY HH:mm'));
    console.log('Current hour:', hours);
    console.log('Night date:', glucose.night.date);
    console.log('Day date:', glucose.day.date);

    // Обновление ночных данных (после 10:00)
    if (hours >= 10 && moment(glucose.night.date, 'DD.MM.YY').isBefore(now, 'day')) {
      console.log('Updating night glucose data...');
      // Получаем данные из LibreView
      const login = await fetch(
        'https://api.libreview.ru/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {email: process.env.LIBRE_EMAIL, password: process.env.LIBRE_PASSWORD}
          ),
        },
      );
      
      if (!login.ok) {
        console.error('LibreView login failed:', login.status, login.statusText);
        return NextResponse.json(glucose);
      }

      const loginResult: {
        data?: {
          authTicket: {
            "token": string,
            "expires": number,
            "duration": number
          }
        }, status: number
      } = await login.json();

      if (!loginResult.data?.authTicket?.token) {
        console.error('LibreView login response missing token:', loginResult);
        return NextResponse.json(glucose);
      }

      const response = await fetch(
        'https://api.libreview.ru/glucoseHistory?numPeriods=2&period=1',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${loginResult.data.authTicket.token}`
          },
        },
      );
      
      if (!response.ok) {
        console.error('LibreView glucose history failed:', response.status, response.statusText);
        return NextResponse.json(glucose);
      }

      glucoseHistory = await response.json();

      if (glucoseHistory) {
        newNight.date = now.format('DD.MM.YY');
        const glucoseNow = glucoseHistory.data.periods[0].avgGlucose;
        const yDayAll = glucoseHistory.data.periods[1].avgGlucose;
        const yDayCut = newDay.totalGlucose;
        const yDayNight = (yDayAll * 3) - (yDayCut * 2);
        const newNightValue = (yDayNight + (glucoseNow * 2)) / 3;

        newNight.value = newNightValue;
        newNight.totalGlucose = glucoseNow;

        if (newNightValue > 8) {
          newNight.highCount += 1;
        } else {
          newNight.highCount = 0;
        }

        if (newNightValue < 6) {
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
        const login = await fetch(
          'https://api.libreview.ru/auth/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {email: process.env.LIBRE_EMAIL, password: process.env.LIBRE_PASSWORD}
            ),
          },
        );
        
        if (!login.ok) {
          console.error('LibreView login failed:', login.status, login.statusText);
          return NextResponse.json(glucose);
        }

        const loginResult: {
          data?: {
            authTicket: {
              "token": string,
              "expires": number,
              "duration": number
            }
          }, status: number
        } = await login.json();

        if (!loginResult.data?.authTicket?.token) {
          console.error('LibreView login response missing token:', loginResult);
          return NextResponse.json(glucose);
        }

        const response = await fetch(
          'https://api.libreview.ru/glucoseHistory?numPeriods=2&period=1',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${loginResult.data.authTicket.token}`
            },
          },
        );
        
        if (!response.ok) {
          console.error('LibreView glucose history failed:', response.status, response.statusText);
          return NextResponse.json(glucose);
        }

        glucoseHistory = await response.json();
      }

      if (glucoseHistory) {
        newDay.date = now.format('DD.MM.YY');
        const glucoseNow = glucoseHistory.data.periods[0].avgGlucose;
        const newDayValue = ((glucoseNow * 3) - newNight.totalGlucose) / 2;

        newDay.value = newDayValue;
        newDay.totalGlucose = glucoseNow;

        if (newDayValue > 9) {
          newDay.highCount += 1;
        } else {
          newDay.highCount = 0;
        }

        if (newDayValue < 6) {
          newDay.lowCount += 1;
        } else {
          newDay.lowCount = 0;
        }
      }
    }

    const newGlucose = {day: newDay, night: newNight};

    // Сохраняем обновленные данные в БД, если были изменения
    if (glucoseHistory) {
      console.log('Saving glucose data to database...');
      const sql = neon(`${process.env.DATABASE_URL}`);
      await sql(`UPDATE glucose
                 SET period        = 'day',
                     date          = '${newGlucose.day.date}',
                     high_count    = ${newGlucose.day.highCount},
                     low_count     = ${newGlucose.day.lowCount},
                     value         = ${newGlucose.day.value},
                     total_glucose = ${newGlucose.day.totalGlucose}
                 WHERE ID = ${newGlucose.day.id}`);

      await sql(`UPDATE glucose
                 SET period        = 'night',
                     date          = '${newGlucose.night.date}',
                     high_count    = ${newGlucose.night.highCount},
                     low_count     = ${newGlucose.night.lowCount},
                     value         = ${newGlucose.night.value},
                     total_glucose = ${newGlucose.night.totalGlucose}
                 WHERE ID = ${newGlucose.night.id}`);
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
