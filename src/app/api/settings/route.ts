import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Settings} from "@/src/app/Providers/StoreProvider";

type SERVER_SETTINGS = Record<"id" |
  "breakfast" |
  "dinner" |
  "long_evening" |
  "long_morning" |
  "lunch", number>[]

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

export const PATCH = async (req: Request) => {
  const settings: Settings = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql(`UPDATE settings
               SET breakfast    = ${settings.breakfast},
                   dinner       = ${settings.dinner},
                   long_evening = ${settings.longEvening},
                   long_morning = ${settings.longMorning},
                   lunch        = ${settings.lunch}
               WHERE ID = ${settings.id}`)

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
