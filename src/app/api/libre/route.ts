import {NextResponse} from "next/server";
import {fetchGlucoseHistory} from "@/src/app/utils/libre";

export const POST = async () => {
  try {
    const result = await fetchGlucoseHistory();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : String(error)});
  }
}
