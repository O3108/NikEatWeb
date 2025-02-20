import {get} from "@vercel/edge-config";
import {NextResponse} from "next/server";

export const GET = async () => {
  const response = await get('settings');

  return NextResponse.json(response);
}
