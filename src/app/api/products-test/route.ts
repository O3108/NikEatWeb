import {NextResponse} from "next/server";

export const GET = async () => {
  try {
    const readItems = await fetch(
      'https://api.vercel.com/v1/edge-config/ecfg_ccwwean4nieg4ymxdzve6dfxhhrs',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer 7d4b200d-3f4b-4979-a254-c39f24c50276`,
        },
      },
    );
    const result = await readItems.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(error);
  }
}
