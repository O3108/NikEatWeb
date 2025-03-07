import {NextResponse} from "next/server";

export type GlucoseHistory = {
  "status": number,
  "data": {
    "lastUpload": number,
    "lastUploadCGM": number,
    "lastUploadPro": number,
    "reminderSent": number,
    "devices": [
      number,
      number
    ],
    "periods": [
      {
        "dateEnd": number,
        "dateStart": number,
        "noData": boolean,
        "dataType": string,
        "avgGlucose": number,
        "serialNumber": string,
        "deviceId": string,
        "deviceType": number,
        "mergeableDevices": null,
        "hypoEvents": number,
        "avgTestsPerDay": number,
        "daysOfData": number,
        "data": {
          "maxGlucoseRange": number,
          "minGlucoseRange": number,
          "maxGlucoseValue": number,
          "blocks": []
        }
      },
      {
        "dateEnd": number,
        "dateStart": number,
        "noData": boolean,
        "dataType": string,
        "avgGlucose": number,
        "serialNumber": string,
        "deviceId": string,
        "deviceType": number,
        "mergeableDevices": null,
        "hypoEvents": number,
        "avgTestsPerDay": number,
        "daysOfData": number,
        "data": {
          "maxGlucoseRange": number,
          "minGlucoseRange": number,
          "maxGlucoseValue": number,
          "blocks": []
        }
      }
    ]
  },
  "ticket": {
    "token": string,
    "expires": number,
    "duration": number
  }
}

export const POST = async (req: Request) => {
  try {
    const login = await fetch(
      'https://api.libreview.ru/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {email: 'o3108@yandex.ru', password: 'Olegchurilov92'}
        ),
      },
    );
    const loginResult: {
      data: {
        authTicket: {
          "token": string,
          "expires": number,
          "duration": number
        }
      }, status: number
    } = await login.json();

    const response = await fetch(
      'https://api.libreview.ru/glucoseHistory?numPeriods=2&period=1',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${loginResult.data.authTicket.token}`
        },
      },
    );
    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
