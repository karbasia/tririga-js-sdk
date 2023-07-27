import AppConfig from "@/services/utils/AppConfig";
import { Query } from "@/services/utils/helpers/QueryParam";
import ModelResultList from "@/services/utils/ModelResultList";
import {
  BaseRecord,
  UpdateRecordResponse,
  CreateRecordResponse,
} from "@/services/utils/helpers/Record";
import Auth from "@/services/Auth";
import BaseModel from "./utils/base/BaseModel";

export default class Model extends BaseModel {
  constructor(appConfig: AppConfig, auth: Auth) {
    super(appConfig, auth);
  }

  async getRecord<T = BaseRecord>(
    context: string,
    query?: Query,
    multiContextIds?: string[],
    countOnly?: boolean,
    reserveIncludeUnavailable?: boolean
  ): Promise<ModelResultList<T>> {
    const requestOptions = this._generateRequestOptions();
    requestOptions.method = query ? "POST" : "GET";
    requestOptions.body = query ? JSON.stringify(query) : null;

    const requestUrl = this._generateRequestUrl(
      context,
      "GET",
      undefined,
      undefined,
      query,
      multiContextIds,
      false,
      countOnly,
      reserveIncludeUnavailable
    );

    const resp = await this._send<ModelResultList<T>>(
      requestUrl,
      requestOptions
    );

    return new ModelResultList<T>(
      resp.totalSize,
      resp.size,
      resp.hasMoreResults,
      resp.from,
      resp.data
    );
  }

  async addRecord<T = BaseRecord>(
    context: string,
    recordIds: string | string[],
    actionGroup?: string | null,
    action?: string | null,
    query?: Query | null,
    refresh?: boolean | null,
    wfParametersMap?: object | null
  ): Promise<UpdateRecordResponse<T>> {
    const [requestOptions, requestUrl] = this._generateRecordActionRequest(
      context,
      recordIds,
      "PUT",
      "ADD",
      query,
      refresh,
      actionGroup,
      action,
      wfParametersMap
    );
    const resp = await this._send<UpdateRecordResponse<T>>(
      requestUrl,
      requestOptions
    );

    return resp;
  }

  async createRecord<T = BaseRecord>(
    context: string,
    data: T | T[],
    actionGroup: string,
    action: string,
    query?: Query | null,
    refresh?: boolean | null,
    wfParametersMap?: object | null
  ): Promise<CreateRecordResponse<T>> {
    const [requestOptions, requestUrl] = this._generateRecordUpdateRequest(
      context,
      data,
      "POST",
      "CREATE",
      query,
      refresh,
      actionGroup,
      action,
      wfParametersMap
    );
    const resp = await this._send<CreateRecordResponse<T>>(
      requestUrl,
      requestOptions
    );

    return resp;
  }

  async deleteRecord<T = BaseRecord>(
    context: string,
    recordIds: string | string[],
    actionGroup?: string | null,
    action?: string | null,
    query?: Query | null,
    refresh?: boolean | null,
    wfParametersMap?: object | null
  ): Promise<UpdateRecordResponse<T>> {
    const [requestOptions, requestUrl] = this._generateRecordActionRequest(
      context,
      recordIds,
      "POST",
      "DELETE",
      query,
      refresh,
      actionGroup,
      action,
      wfParametersMap
    );
    const resp = await this._send<UpdateRecordResponse<T>>(
      requestUrl,
      requestOptions
    );

    return resp;
  }

  async performAction<T = BaseRecord>(
    context: string,
    recordIds: string | string[],
    actionGroup?: string | null,
    action?: string | null,
    query?: Query | null,
    refresh?: boolean | null,
    wfParametersMap?: object | null
  ): Promise<UpdateRecordResponse<T>> {
    const [requestOptions, requestUrl] = this._generateRecordActionRequest(
      context,
      recordIds,
      "PUT",
      "SAVE",
      query,
      refresh,
      actionGroup,
      action,
      wfParametersMap
    );
    const resp = await this._send<UpdateRecordResponse<T>>(
      requestUrl,
      requestOptions
    );

    return resp;
  }

  async removeRecord<T = BaseRecord>(
    context: string,
    recordIds: string | string[],
    actionGroup?: string | null,
    action?: string | null,
    query?: Query | null,
    refresh?: boolean | null,
    wfParametersMap?: object | null
  ): Promise<UpdateRecordResponse<T>> {
    const [requestOptions, requestUrl] = this._generateRecordActionRequest(
      context,
      recordIds,
      "PUT",
      "REMOVE",
      query,
      refresh,
      actionGroup,
      action,
      wfParametersMap
    );
    const resp = await this._send<UpdateRecordResponse<T>>(
      requestUrl,
      requestOptions
    );

    return resp;
  }

  async updateRecord<T = BaseRecord>(
    context: string,
    data: T | T[],
    actionGroup?: string | null,
    action?: string | null,
    query?: Query | null,
    refresh?: boolean | null,
    wfParametersMap?: object | null
  ): Promise<UpdateRecordResponse<T>> {
    const [requestOptions, requestUrl] = this._generateRecordUpdateRequest(
      context,
      data,
      "PUT",
      "SAVE",
      query,
      refresh,
      actionGroup,
      action,
      wfParametersMap
    );
    const resp = await this._send<UpdateRecordResponse<T>>(
      requestUrl,
      requestOptions
    );

    return resp;
  }
}
