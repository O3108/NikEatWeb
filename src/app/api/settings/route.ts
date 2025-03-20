import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Settings} from "@/src/app/Providers/StoreProvider";

type SERVER_SETTINGS = [{
  "id": number,
  "breakfast": number,
  "dinner": number,
  "long_evening": number,
  "long_morning": number,
  "lunch": number,
}]

export const GET = async () => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response: SERVER_SETTINGS = await sql('SELECT * FROM settings')
    const settings = response[0]

    return NextResponse.json(
      {...settings, longEvening: settings.long_evening, longMorning: settings.long_morning}
    );
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}

export const POST = async (req: Request) => {
  const settings: Settings = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql('TRUNCATE TABLE settings')
    await sql(
      'INSERT INTO settings (breakfast, dinner, long_evening, long_morning, lunch) VALUES ($1, $2, $3, $4, $5)',
      [settings.breakfast, settings.dinner, settings.longEvening, settings.longMorning, settings.lunch]
    )

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
