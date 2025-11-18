// Пороговые значения глюкозы
export const GLUCOSE_THRESHOLDS = {
  LOW: 6,
  HIGH_NIGHT: 8,
  HIGH_DAY: 9,
  HIGH_ALL_DAY: 8.5,
} as const;

// Общий тип для периода глюкозы
export type GlucosePeriodData = {
  id: number;
  date: string;
  value: number;
  highCount: number;
  lowCount: number;
  totalGlucose: number;
};
