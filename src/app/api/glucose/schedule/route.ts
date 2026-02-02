import {NextResponse} from "next/server";
import moment from "moment-timezone";
import {GET as getGlucoseSnapshot} from "@/src/app/api/glucose/route";
import {POST as calculateGlucose} from "@/src/app/api/glucose/calculate/route";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const snapshotResponse = await getGlucoseSnapshot();

    if (!snapshotResponse.ok) {
      return NextResponse.json(
        {error: "Не удалось получить текущие данные глюкозы"},
        {status: snapshotResponse.status},
      );
    }

    const glucosePayload = await snapshotResponse.json();

    const calculateRequest = new Request("http://localhost/api/glucose/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(glucosePayload),
    });

    const updateResponse = await calculateGlucose(calculateRequest);

    if (!updateResponse.ok) {
      const errorMessage = await updateResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "Ошибка при пересчёте данных глюкозы",
          details: errorMessage,
        },
        {status: updateResponse.status},
      );
    }

    const updatedGlucose = await updateResponse.json();

    return NextResponse.json({
      status: "ok",
      triggeredAt: moment().tz("Asia/Yekaterinburg").format("DD.MM.YYYY HH:mm:ss"),
      initialGlucose: glucosePayload,
      updatedGlucose,
    });
  } catch (error: unknown) {
    console.error("Глюкозный крон: непредвиденная ошибка", error);
    return NextResponse.json(
      {
        error: "Внутренняя ошибка при выполнении расписания",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      {status: 500},
    );
  }
};
