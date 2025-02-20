import {get} from "@vercel/edge-config";
import {NextResponse} from "next/server";

export const GET = async () => {
  const response = await get('products');

  return NextResponse.json(response);
}

export const PATCH = async () => {
  try {
    const updateEdgeConfig = await fetch(
      'https://api.vercel.com/v1/edge-config/ecfg_ccwwean4nieg4ymxdzve6dfxhhrs/items',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer 7d4b200d-3f4b-4979-a254-c39f24c50276`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'create',
              key: 'example_key_1',
              value: 'example_value_1',
            },
            {
              operation: 'update',
              key: 'example_key_2',
              value: 'new_value',
            },
          ],
        }),
      },
    );
    const result = await updateEdgeConfig.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(error);
  }
}
