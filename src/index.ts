import Model from "@/services/Model";
import Auth, { User } from "@/services/Auth";
import AppConfig from "@/services/utils/AppConfig";
import { WebAppProperties } from "@/services/utils/AppConfig";
import ModelResultList from "@/services/utils/ModelResultList";
import {
  BaseRecord,
  UpdateRecordResponse,
  CreateRecordResponse,
} from "@/services/utils/helpers/Record";
import { Query, QueryFilters } from "@/services/utils/helpers/QueryParam";
import {
  EndTypes,
  DailyTypes,
  YearlyTypes,
  MonthlyTypes,
  RecurrenceType,
  WeekOfMonth,
  DayOfWeek,
  WeeklyDays,
  Months,
} from "@/services/utils/helpers/Recurrence";
import {
  Recurrence,
  RecurrenceEnd,
  DailyRecurrence,
  WeeklyRecurrence,
  MonthlyRecurrence,
  YearlyRecurrence,
} from "@/services/utils/helpers/Recurrence";
import Client from "@/Client";

export {
  WebAppProperties,
  AppConfig,
  BaseRecord,
  ModelResultList,
  Model,
  Query,
  QueryFilters,
  EndTypes,
  DailyTypes,
  YearlyTypes,
  MonthlyTypes,
  RecurrenceType,
  WeekOfMonth,
  DayOfWeek,
  WeeklyDays,
  Months,
  Recurrence,
  RecurrenceEnd,
  DailyRecurrence,
  WeeklyRecurrence,
  MonthlyRecurrence,
  YearlyRecurrence,
  Auth,
  User,
  UpdateRecordResponse,
  CreateRecordResponse,
};

export default Client;
