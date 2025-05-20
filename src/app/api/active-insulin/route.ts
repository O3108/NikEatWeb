import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {ActiveInsulin} from "@/src/app/Providers/StoreProvider";

type SERVER_GLUCOSE = Record<"id" | "date" | "value", number |
  string>[]

export const GET = async () => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response: SERVER_GLUCOSE = await sql('SELECT * FROM "active-insulin"')

    return NextResponse.json(
      {
        id: response[0].id,
        date: response[0].date,
        value: response[0].value,
      });
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}

export const PATCH = async (req: Request) => {
  const activeInsulin: ActiveInsulin = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql(`UPDATE "active-insulin"
               SET date  = '${activeInsulin.date}',
                   value = ${activeInsulin.value}
               WHERE ID = ${activeInsulin.id}`)

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
