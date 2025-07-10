import AppConfig from "@/services/utils/AppConfig";
import { Query } from "@/services/utils/helpers/QueryParam";
import { BaseRecord } from "@/services/utils/helpers/Record";
import Auth from "@/services/Auth";

interface RequestBody<T> {
  data?: object | T | Array<T> | null;
  query?: Query;
  wfParametersMap?: object | null;
}

export default class BaseModel {
  appConfig: AppConfig;
  auth: Auth;

  webContextId?: string;

  private WEB_CONTEXT_HEADER_NAME = "triWebContextId";

  constructor(appConfig: AppConfig, auth: Auth) {
    this.appConfig = appConfig;
    this.auth = auth;
  }

  async Init() {
    await this._setWebContextId();
  }

  protected _generateRecordUpdateRequest<T = BaseRecord>(
    context: string,
    data: T | T[],
    method: string,
    type: string,
    query?: Query | null,
    refresh?: boolean | null,
    actionGroup?: string | null,
    action?: string | null,
    wfParametersMap?: object | null
  ): [RequestInit, URL] {
    const requestOptions = this._generateRequestOptions();

    const requestBody: RequestBody<T> = { data };

    if (query) {
      requestBody.query = query;
    }
    if (wfParametersMap) {
      requestBody.wfParametersMap = wfParametersMap;
    }

    requestOptions.method = method;
    requestOptions.body = JSON.stringify(requestBody);

    const requestUrl = this._generateRequestUrl(
      context,
      type,
      actionGroup,
      action,
      query,
      undefined,
      refresh,
      false,
      false
    );

    return [requestOptions, requestUrl];
  }

  protected _generateRecordActionRequest<T = BaseRecord>(
    context: string,
    recordIds: string | string[],
    method: string,
    type: string,
    query?: Query | null,
    refresh?: boolean | null,
    actionGroup?: string | null,
    action?: string | null,
    wfParametersMap?: object | null
  ): [RequestInit, URL] {
    const recordIdsValue = this._buildRecordIds(recordIds);
    const requestOptions = this._generateRequestOptions();

    const requestBody: RequestBody<T> = {
      data: recordIdsValue,
    };

    if (query) {
      requestBody.query = query;
    }
    if (wfParametersMap) {
      requestBody.wfParametersMap = wfParametersMap;
    }

    requestOptions.method = method;
    requestOptions.body = JSON.stringify(requestBody);

    const requestUrl = this._generateRequestUrl(
      context,
      type,
      actionGroup,
      action,
      query,
      undefined,
      refresh,
      false,
      false
    );

    return [requestOptions, requestUrl];
  }

  protected async _setWebContextId() {
    const requestOptions: RequestInit = this.auth.generateRequestHeaders({
      cache: "no-cache",
    });
    const req = new Request(
      `${this.appConfig.tririgaUrl}/p/webapi/noop`,
      requestOptions
    );
    const res = await fetch(req);

    if (!res.ok) {
      throw new Error(
        "Could not get the web context. Please verify your session."
      );
    }
    this.webContextId = res.headers.get(this.WEB_CONTEXT_HEADER_NAME) || "";
  }

  protected async _send<T = unknown>(
    requestUrl: URL,
    requestOptions: RequestInit
  ): Promise<T> {
    const resp = await fetch(new Request(requestUrl, requestOptions));
    let data: unknown = {};

    if (resp.status >= 400) {
      throw new Error(`Error. API responded with status ${resp.status}`);
    }

    try {
      data = await resp.json();
    } catch (err) {
      console.error(err);
    }

    return data as T;
  }

  protected _generateRequestUrl(
    context: string,
    type: string,
    actionGroup?: string | null,
    action?: string | null,
    query?: Query | null,
    multiContextIds?: string[] | null,
    refresh?: boolean | null,
    countOnly?: boolean | null,
    reserveIncludeUnavailable?: boolean | null
  ): URL {
    const requestUrl = new URL(
      `${this.appConfig.tririgaUrl}/p/webapi/rest/v2/${this.appConfig.modelAndView}/${this.appConfig.instanceId}/${context}`
    );

    if (type === "GET") {
      if (query) {
        requestUrl.searchParams.set("query", "true");
      }
      if (countOnly) {
        requestUrl.searchParams.set("countOnly", "true");
      }
      if (reserveIncludeUnavailable) {
        requestUrl.searchParams.set("reserveIncludeUnavailable", "true");
      }
      if (multiContextIds && multiContextIds.length > 0) {
        requestUrl.searchParams.set("multiContextIds", multiContextIds.join());
      }
    } else if (type === "GET_QUERY_METADATA") {
      requestUrl.searchParams.set("method", "dsMetadata");
    } else {
      if (actionGroup) {
        requestUrl.searchParams.set("actionGroup", actionGroup);
      }
      if (action) {
        requestUrl.searchParams.set("action", action);
      }
      if (refresh) {
        requestUrl.searchParams.set("refresh", "true");
      }
      if (type === "ADD") {
        requestUrl.searchParams.set("type", "add");
      } else if (type === "REMOVE") {
        requestUrl.searchParams.set("type", "remove");
      } else if (type === "DELETE") {
        requestUrl.searchParams.set("method", "delete");
      }
    }

    return requestUrl;
  }

  protected _generateRequestOptions(): RequestInit {
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };
    requestHeaders[this.WEB_CONTEXT_HEADER_NAME] = this.webContextId || "";

    const requestOptions: RequestInit = this.auth.generateRequestHeaders({
      cache: "no-cache",
      headers: requestHeaders,
    });

    return requestOptions;
  }

  protected _buildRecordIds(
    recordIds: string | string[]
  ): object[] | object | null {
    if (Array.isArray(recordIds)) {
      return recordIds.map(_id => {
        _id;
      });
    } else if (recordIds) {
      return { _id: recordIds };
    }
    return null;
  }
}
