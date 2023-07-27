export enum EndTypes {
  END_AFTER = "End After",
  END_DATE = "End Date",
  NO_END_DATE = "No End Date",
}

export enum DailyTypes {
  EVERY_X_DAYS = "Every [x] day(s)",
  EVERY_WEEKDAY = "Every weekday",
  EVERY_WEEKEND_DAY = "Every weekend day",
}

export enum WeeklyDays {
  SUN = "Sunday",
  MON = "Monday",
  TUES = "Tuesday",
  WED = "Wednesday",
  THURS = "Thursday",
  FRI = "Friday",
  SAT = "Saturday",
}

export enum MonthlyTypes {
  DAY_X_EVERY_X_MONTHS = "Day [x] of every [x] month(s)",
  THE_X_EVERY_X_MONTH = "The [First] [Monday] of every [x] month(s)",
}

export enum DayOfWeek {
  DAY = "day",
  WEEKDAY = "weekday",
  WEEKEND = "weekend day",
}

export enum WeekOfMonth {
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FOURTH = "fourth",
  LAST = "last",
}

export enum YearlyTypes {
  EVERY_MONTH_DAY = "Every [May] [1]",
  THE_X_DAY_OF_MONTH = "The [First] [Monday] of [May]",
}

export enum Months {
  JAN = "January",
  FEB = "February",
  MAR = "March",
  APR = "April",
  MAY = "May",
  JUN = "June",
  JUL = "July",
  AUG = "August",
  SEP = "September",
  OCT = "October",
  NOV = "November",
  DEC = "December",
}

export enum RecurrenceType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

const endTypeValues = <const>[
  EndTypes.END_AFTER,
  EndTypes.END_DATE,
  EndTypes.NO_END_DATE,
];
const dailyTypeValues = <const>[
  DailyTypes.EVERY_X_DAYS,
  DailyTypes.EVERY_WEEKDAY,
  DailyTypes.EVERY_WEEKEND_DAY,
];
const weeklyDaysValues = <const>[
  WeeklyDays.SUN,
  WeeklyDays.MON,
  WeeklyDays.TUES,
  WeeklyDays.WED,
  WeeklyDays.THURS,
  WeeklyDays.FRI,
  WeeklyDays.SAT,
];
const monthlyTypeValues = <const>[
  MonthlyTypes.DAY_X_EVERY_X_MONTHS,
  MonthlyTypes.THE_X_EVERY_X_MONTH,
];
const dayOfWeekValues = <const>[
  ...weeklyDaysValues,
  DayOfWeek.DAY,
  DayOfWeek.WEEKDAY,
  DayOfWeek.WEEKEND,
];
const weekOfMonthValues = <const>[
  WeekOfMonth.FIRST,
  WeekOfMonth.SECOND,
  WeekOfMonth.THIRD,
  WeekOfMonth.FOURTH,
  WeekOfMonth.LAST,
];
const yearlyTypeValues = <const>[
  YearlyTypes.EVERY_MONTH_DAY,
  YearlyTypes.THE_X_DAY_OF_MONTH,
];
const monthValues = <const>[
  Months.JAN,
  Months.FEB,
  Months.MAR,
  Months.APR,
  Months.MAY,
  Months.JUN,
  Months.JUL,
  Months.AUG,
  Months.SEP,
  Months.OCT,
  Months.NOV,
  Months.DEC,
];
const recurrenceTypeValues = <const>[
  RecurrenceType.DAILY,
  RecurrenceType.WEEKLY,
  RecurrenceType.MONTHLY,
  RecurrenceType.YEARLY,
];

export interface RecurrenceEnd {
  type: (typeof endTypeValues)[number];
  endDate?: Date;
  numberOfOccurencesBeforeEnd?: number;
}

export interface DailyRecurrence {
  type: (typeof dailyTypeValues)[number];
  interval?: number;
  end: RecurrenceEnd;
}

export interface WeeklyRecurrence {
  interval: number;
  weeklyDays: (typeof weeklyDaysValues)[number][];
  end: RecurrenceEnd;
}

export interface MonthlyRecurrence {
  type: (typeof monthlyTypeValues)[number];
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: (typeof dayOfWeekValues)[number];
  weekOfMonth?: (typeof weekOfMonthValues)[number];
  end: RecurrenceEnd;
}

export interface YearlyRecurrence {
  type: (typeof yearlyTypeValues)[number];
  dayOfMonth?: number;
  dayOfWeek?: (typeof dayOfWeekValues)[number];
  weekOfMonth?: (typeof weekOfMonthValues)[number];
  month: (typeof monthValues)[number];
  end: RecurrenceEnd;
}

export interface Recurrence {
  type: (typeof recurrenceTypeValues)[number];
  dailyProperties?: DailyRecurrence;
  weeklyProperties?: WeeklyRecurrence;
  monthlyProperties?: MonthlyRecurrence;
  yearlyProperties?: YearlyRecurrence;
}
