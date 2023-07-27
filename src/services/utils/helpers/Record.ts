import ModelResultList from "@/services/utils/ModelResultList";

export interface BaseRecord {
  _id: string;
  [key: string]: any;
}

export interface UpdateRecordResponse<T> {
  wfParametersMap?: { [key: string]: number };
  refresh?: ModelResultList<T>;
}

export interface CreateRecordResponse<T> {
  createdRecordId?: string;
  createdRecordIds?: string[];
  wfParametersMap?: { [key: string]: number };
  refresh?: ModelResultList<T>;
}
