export type AuthTicket = {
  token: string;
  expires: number;
  duration: number;
};

export type LibreAuthResponse = {
  data: {
    authTicket: AuthTicket;
  };
  status: number;
};

export type GlucosePeriod = {
  dateEnd: number;
  dateStart: number;
  noData: boolean;
  dataType: string;
  avgGlucose: number;
  serialNumber: string;
  deviceId: string;
  deviceType: number;
  mergeableDevices: null;
  hypoEvents: number;
  avgTestsPerDay: number;
  daysOfData: number;
  data: {
    maxGlucoseRange: number;
    minGlucoseRange: number;
    maxGlucoseValue: number;
    blocks: [];
  };
};

export type GlucoseHistory = {
  status: number;
  data: {
    periods: GlucosePeriod[];
  };
  ticket?: AuthTicket;
};

const LIBRE_BASE_URL = 'https://api.libreview.ru';

/**
 * Авторизуется в LibreView, проходит скип-задачу и возвращает историю глюкозы.
 * Бросает ошибку с понятным сообщением при любой неудаче.
 */
export const fetchGlucoseHistory = async (): Promise<GlucoseHistory> => {
  const email = process.env.LIBRE_EMAIL;
  const password = process.env.LIBRE_PASSWORD;
  if (!email || !password) {
    throw new Error('LIBRE_EMAIL and LIBRE_PASSWORD env vars must be set');
  }

  const login = await fetch(`${LIBRE_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email, password}),
  });
  const loginResult = (await login.json()) as LibreAuthResponse;
  if (!login.ok) {
    throw new Error(`LibreView login failed (${login.status}): ${JSON.stringify(loginResult)}`);
  }

  const skiptask = await fetch(`${LIBRE_BASE_URL}/auth/continue/skiptask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${loginResult.data.authTicket.token}`,
    },
  });
  const skiptaskResult = (await skiptask.json()) as LibreAuthResponse;
  if (!skiptask.ok) {
    throw new Error(`LibreView skiptask failed (${skiptask.status}): ${JSON.stringify(skiptaskResult)}`);
  }

  const authTicket = skiptaskResult.data?.authTicket;
  if (!authTicket?.token) {
    throw new Error('LibreView skiptask returned no authTicket');
  }

  const response = await fetch(
    `${LIBRE_BASE_URL}/glucoseHistory?numPeriods=2&period=1`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authTicket.token}`,
      },
    },
  );
  const result = (await response.json()) as GlucoseHistory;
  if (!response.ok) {
    throw new Error(`LibreView glucoseHistory failed (${response.status}): ${JSON.stringify(result)}`);
  }

  return result;
};
