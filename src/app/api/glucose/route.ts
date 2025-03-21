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

    return NextResponse.json(
      {
        day: glucoseDay && {
          id: glucoseDay.id,
          date: glucoseDay.date,
          highCount: glucoseDay.high_count,
          lowCount: glucoseDay.low_count,
          value: glucoseDay.value,
          totalGlucose: glucoseDay.total_glucose
        },
        night: glucoseNight && {
          id: glucoseNight.id,
          date: glucoseNight.date,
          highCount: glucoseNight.high_count,
          lowCount: glucoseNight.low_count,
          value: glucoseNight.value,
          totalGlucose: glucoseNight.total_glucose
        }
      });
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}

export const PATCH = async (req: Request) => {
  const glucose: Glucose = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql(`UPDATE glucose
               SET period        = 'day',
                   date          = '${glucose.day.date}',
                   high_count    = ${glucose.day.highCount},
                   low_count     = ${glucose.day.lowCount},
                   value         = ${glucose.day.value},
                   total_glucose = ${glucose.day.totalGlucose}
               WHERE ID = ${glucose.day.id}`)

    await sql(`UPDATE glucose
               SET period        = 'night',
                   date          = '${glucose.night.date}',
                   high_count    = ${glucose.night.highCount},
                   low_count     = ${glucose.night.lowCount},
                   value         = ${glucose.night.value},
                   total_glucose = ${glucose.night.totalGlucose}
               WHERE ID = ${glucose.night.id}`)

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
