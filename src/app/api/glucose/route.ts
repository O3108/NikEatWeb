import {NextResponse} from "next/server";
import {get} from "@vercel/edge-config";

export const GET = async () => {
  try {
    const response = await get('avgGlucose');

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}

export const PATCH = async (req: Request) => {
  const glucose = await req.json()

  try {
    const updateEdgeConfig = await fetch(
      'https://api.vercel.com/v1/edge-config/ecfg_ccwwean4nieg4ymxdzve6dfxhhrs/items',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer tj9bIPCY1PhrnW3knXIgAkni`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{operation: 'update', key: 'avgGlucose', value: glucose}],
        }),
      },
    );
    const result = await updateEdgeConfig.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
