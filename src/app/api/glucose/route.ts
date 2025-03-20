import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Glucose} from "@/src/app/Providers/StoreProvider";

type SERVER_GLUCOSE = [{
  "id": number,
  "period": "day",
  "date": string,
  "high_count": number,
  "low_count": number,
  "value": number,
  "total_glucose": number
}, {
  "id": number,
  "period": "night",
  "date": string,
  "high_count": number,
  "low_count": number,
  "value": number,
  "total_glucose": number
}]

export const GET = async () => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response: SERVER_GLUCOSE = await sql('SELECT * FROM glucose')
    const glucoseDay = response.find(item => item.period === 'day')
    const glucoseNight = response.find(item => item.period === 'night')

    return NextResponse.json(
      {
        day: glucoseDay && {
          date: glucoseDay.date,
          highCount: glucoseDay.high_count,
          lowCount: glucoseDay.low_count,
          value: glucoseDay.value,
          totalGlucose: glucoseDay.total_glucose
        },
        night: glucoseNight && {
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

export const POST = async (req: Request) => {
  const glucose: Glucose = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql('TRUNCATE TABLE glucose')
    await sql(
      'INSERT INTO glucose (period, date, high_count, low_count, value, total_glucose) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        'day',
        glucose.day.date,
        glucose.day.highCount,
        glucose.day.lowCount,
        glucose.day.value,
        glucose.day.totalGlucose
      ]
    )
    await sql(
      'INSERT INTO glucose (period, date, high_count, low_count, value, total_glucose) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        'night',
        glucose.night.date,
        glucose.night.highCount,
        glucose.night.lowCount,
        glucose.night.value,
        glucose.night.totalGlucose
      ]
    )

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
