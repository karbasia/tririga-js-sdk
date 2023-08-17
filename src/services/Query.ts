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
  [key: string]: unknown;
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

/** Platform 4.2+.The Query class is used to retrieve and execute TRIRIGA queries. */
export default class Query {
  appConfig: AppConfig;
  auth: Auth;

  /** @hidden */
  constructor(appConfig: AppConfig, auth: Auth) {
    this.appConfig = appConfig;
    this.auth = auth;
  }

  /**
   * Retrieves the system report list
   *
   * @remarks
   * An async function that returns the results of system reports. The authenticated user must have access to system reports to view this data.
   *
   * @param pageNumber The current page number
   * @param perPage The total number of reports per page
   * @returns A `QueryListResults` object with the query details
   *
   * @throws Error if the query list could not be retrieved. This is caused by connectivity, session or user permission issues.
   */
  async getQueryList(
    pageNumber: number,
    perPage: number
  ): Promise<QueryListResults> {
    // Ensure that the CSRF Token is still valid
    if (await this.auth.updateCsrfToken()) {
      const queryParams = {
        objectId: "1200000",
        actionId: "1200501",
        managerReportType: "SystemReport",
        currentPageNumber: pageNumber.toString(),
        noOfReports: perPage.toString(),
      };

      const headers: HeadersInit = {};
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
          const results: QueryListResults = {
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

  /**
   * Retrieves the query metadata
   *
   * @remarks
   * The query metadata will contain details surrounding the columns.
   *
   * @param templateId The unique query ID
   * @returns A `QueryMetadata` object
   *
   * @throws Error if the query is not found or if the client encounters connectivity issues.
   */
  async getQueryDefinition(templateId: number): Promise<QueryMetadata> {
    const queryMetadata: QueryMetadata = { columnDefinitions: [] };
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
      }
      return queryMetadata;
    }

    throw new Error("Could not determine query metadata");
  }

  /**
   * Returns the query data for a specific page.
   *
   * @remarks
   * This method is used to retrieve data from a specific query. It will return an object that contains the data with the defined columns.
   *
   * @param templateId The unique query ID
   * @param pageNumber The current page number
   * @param pageSize The page size
   * @returns A `QueryData` object containing record details for the current page.
   *
   * @throws Error if the input is invalid or if the client encounters connectivity issues.
   */
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
}
