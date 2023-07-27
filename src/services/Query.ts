import Auth from "./Auth";
import AppConfig from "./utils/AppConfig";

interface QueryDetails {
  formId: number;
  reportId: number;
  moduleName: string;
  HtmlEscapedTitle?: string;
  AllFormNames: string;
  boLabels: string;
  AllFormLabels: string;
  HtmlEscapedName: string;
  boNames: string;
}

export interface QueryListResults {
  data?: QueryDetails[];
  totalPageCount: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPageNumber: number;
  totalCount: number;
}

interface QueryColumnDefinitions {
  [key: string]: any;
}

export interface QueryMetadata {
  columnDefinitions: QueryColumnDefinitions[];
}

export interface QueryData {
  data: { [key: string]: string }[];
  headers: QueryColumnDefinitions[];
  hasNext: boolean;
  hasPrevious: boolean;
  pageNumber: number;
  totalPages: number;
  resultSize: number;
  totalSize: number;
}

export default class Query {
  appConfig: AppConfig;
  auth: Auth;

  constructor(appConfig: AppConfig, auth: Auth) {
    this.appConfig = appConfig;
    this.auth = auth;
  }

  async getQueryList(
    pageNumber: number,
    perPage: number
  ): Promise<QueryListResults> {
    // Ensure that the CSRF Token is still valid
    if (await this.auth.updateCsrfToken()) {
      let queryParams = {
        objectId: "1200000",
        actionId: "1200501",
        managerReportType: "SystemReport",
        currentPageNumber: pageNumber.toString(),
        noOfReports: perPage.toString(),
      };

      let headers: HeadersInit = {};
      headers[this.auth.csrfToken.name] = this.auth.csrfToken.value;

      const urlParams = new URLSearchParams(queryParams);
      const reqOptions = this.auth.generateRequestHeaders({
        method: "POST",
        body: urlParams,
        headers,
      });

      const req = await fetch(
        `${this.appConfig.tririgaUrl}/WebProcess.srv`,
        reqOptions
      );

      if (req.ok) {
        const resp = await req.json();
        if (resp.length > 1) {
          let results: QueryListResults = {
            totalPageCount: resp[1].TotalNumberOfPages,
            resultsPerPage: resp[1].ResultsPerPage,
            hasNextPage: resp[1].IsNext,
            hasPreviousPage: resp[1].IsPrevious,
            currentPageNumber: resp[1].currentPageNumber,
            totalCount: resp[1].TotalResultCnt,
            data: resp[0] as QueryDetails[],
          };
          return results;
        }
      }
    }

    throw new Error("Could not retrieve query list");
  }

  async getQueryDefinition(templateId: number): Promise<QueryMetadata> {
    let queryMetadata: QueryMetadata = { columnDefinitions: [] };
    const reqOptions = this.auth.generateRequestHeaders();
    const urlParams = new URLSearchParams({
      reportTemplId: templateId.toString(),
    });
    const req = await fetch(
      `${this.appConfig.tririgaUrl}/api/v1/query/config?${urlParams}`,
      reqOptions
    );

    if (req.ok) {
      const resp = await req.json();
      if (resp["error_message"]) {
        throw new Error(resp["error_message"]);
      }
      if (resp["gridConfig"] && resp["gridConfig"]["columns"].length > 0) {
        queryMetadata.columnDefinitions = resp["gridConfig"]["columns"];

        // queryMetadata.columnDefinitions = resp['gridConfig']['columns'].reduce((arr: any, col: any) => {
        //   return {
        //     ...arr,
        //     [col['id']]: col
        //   }
        // }, {});
      }
      return queryMetadata;
    }

    throw new Error("Could not determine query metadata");
  }

  async getQueryData(
    templateId: number,
    pageNumber = 0,
    pageSize = 50
  ): Promise<QueryData> {
    const queryMetadata = await this.getQueryDefinition(templateId);

    if (queryMetadata.columnDefinitions.length > 0) {
      const reqOptions = this.auth.generateRequestHeaders();
      const urlParams = new URLSearchParams({
        reportTemplId: templateId.toString(),
        pageNo: pageNumber.toString(),
        resultSizeIn: pageSize.toString(),
      });
      const req = await fetch(
        `${this.appConfig.tririgaUrl}/api/v1/query/data?${urlParams}`,
        reqOptions
      );

      if (req.ok) {
        const resp = await req.json();
        const queryData: QueryData = {
          data: resp["data"],
          headers: queryMetadata.columnDefinitions,
          hasNext: resp["result_has_next"],
          hasPrevious: resp["result_has_previous"],
          pageNumber: resp["result_page_number"],
          totalPages: resp["result_total_pages"],
          resultSize: resp["result_count"],
          totalSize: resp["result_total_size"],
        };
        return queryData;
      }

      throw new Error("Could not retrieve query data");
    }

    throw Error("Invalid query metadata");
  }

  // private _generateDataObject(columnDef: QueryColumnDefinitions, rawData: QueryData): QueryData {
  //   let data: QueryData = {};

  //   for (let key in rawData) {
  //     data[columnDef[key]] = rawData[key];
  //   }

  //   return data;
  // }
}
