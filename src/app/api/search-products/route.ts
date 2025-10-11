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
  const name: string = await req.json()
  console.log('aaa', name)
  const data = {
    'query[count_on_page]': '50',
    'query[page]': '1',
    'query[name]': name,
  };

  const body = new URLSearchParams(data).toString();

  try {
    const response = await fetch("https://fs2.tvoydnevnik.com/api2/food_search/searchTable", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body,
      "method": "POST"
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
