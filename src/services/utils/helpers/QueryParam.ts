import { Recurrence } from "@/services/utils/helpers/Recurrence";

export enum QueryFilters {
  CONTAINS = "contains",
  EQUALS = "equals",
  NOT_EQUALS = "not equals",
  STARTS_WITH = "starts with",
  LESS_THAN = "less than",
  LESS_THAN_EQUALS = "less than or equals",
  GREATER_THAN = "greater than",
  GREATER_THAN_EQUALS = "greater than or equals",
  IN = "in",
}

const queryFilterValues = <const>[
  QueryFilters.CONTAINS,
  QueryFilters.EQUALS,
  QueryFilters.NOT_EQUALS,
  QueryFilters.STARTS_WITH,
  QueryFilters.LESS_THAN,
  QueryFilters.LESS_THAN_EQUALS,
  QueryFilters.GREATER_THAN,
  QueryFilters.GREATER_THAN_EQUALS,
  QueryFilters.IN,
];

export interface Filters {
  operator: (typeof queryFilterValues)[number];
  name: string;
  value: string;
}

export interface Sorts {
  name: string;
  desc: boolean;
}

export interface Page {
  from: number;
  size: number;
}

export interface Calendar {
  startDate: Date;
  endDate: Date;
  name: string;
}

export interface ReserveContext {
  startDate: Date;
  endDate: Date;
  resultsLimit?: number;
  recurrence: Recurrence;
  availabilityThreshold: number;
  returnOccurrenceList: boolean;
}

export interface Query {
  filters?: Filters;
  sorts?: Sorts;
  page?: Page;
  calendar?: Calendar;
  reserveContext?: ReserveContext;
}
