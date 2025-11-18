import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Glucose} from "@/src/app/Providers/StoreProvider";

type SERVER_GLUCOSE = Record<"id" | "period" | "date" | "high_count" | "low_count" | "value" | "total_glucose", number |
  string | Date>[]

export const GET = async () => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response: SERVER_GLUCOSE = await sql('SELECT * FROM glucose')
    const glucoseDay = response.find(item => item.period === 'day')
    const glucoseNight = response.find(item => item.period === 'night')
    const glucoseAllDay = response.find(item => item.period === 'allDay')

    // Проверяем наличие всех необходимых периодов
    if (!glucoseDay || !glucoseNight) {
      return NextResponse.json(
        {error: 'Missing required glucose periods in database'},
        {status: 500}
      );
    }

    return NextResponse.json(
      {
        day: {
          id: glucoseDay.id,
          date: glucoseDay.date,
          highCount: glucoseDay.high_count,
          lowCount: glucoseDay.low_count,
          value: glucoseDay.value,
          totalGlucose: glucoseDay.total_glucose
        },
        night: {
          id: glucoseNight.id,
          date: glucoseNight.date,
          highCount: glucoseNight.high_count,
          lowCount: glucoseNight.low_count,
          value: glucoseNight.value,
          totalGlucose: glucoseNight.total_glucose
        },
        allDay: glucoseAllDay ? {
          id: glucoseAllDay.id,
          date: glucoseAllDay.date,
          highCount: glucoseAllDay.high_count,
          lowCount: glucoseAllDay.low_count,
          value: glucoseAllDay.value,
          totalGlucose: glucoseAllDay.total_glucose
        } : {
          id: 0,
          date: '',
          highCount: 0,
          lowCount: 0,
          value: 0,
          totalGlucose: 0
        }
      });
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}

export const PATCH = async (req: Request) => {
  const glucose: Glucose = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Используем параметризованные запросы для защиты от SQL-инъекций
    await sql(
      'UPDATE glucose SET period = $1, date = $2, high_count = $3, low_count = $4, value = $5, total_glucose = $6 WHERE id = $7',
      ['day', glucose.day.date, glucose.day.highCount, glucose.day.lowCount, glucose.day.value, glucose.day.totalGlucose, glucose.day.id]
    );

    await sql(
      'UPDATE glucose SET period = $1, date = $2, high_count = $3, low_count = $4, value = $5, total_glucose = $6 WHERE id = $7',
      ['night', glucose.night.date, glucose.night.highCount, glucose.night.lowCount, glucose.night.value, glucose.night.totalGlucose, glucose.night.id]
    );

    // Обновляем allDay только если он существует в БД
    if (glucose.allDay && glucose.allDay.id > 0) {
      await sql(
        'UPDATE glucose SET period = $1, date = $2, high_count = $3, low_count = $4, value = $5, total_glucose = $6 WHERE id = $7',
        ['allDay', glucose.allDay.date, glucose.allDay.highCount, glucose.allDay.lowCount, glucose.allDay.value, glucose.allDay.totalGlucose, glucose.allDay.id]
      );
    }

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
