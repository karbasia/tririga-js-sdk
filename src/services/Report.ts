import Auth from "./Auth";
import AppConfig from "./utils/AppConfig";

export interface ReportDetails {
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

export interface ReportListResults {
  data?: ReportDetails[];
  totalPageCount: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPageNumber: number;
  totalCount: number;
}

interface ReportColumnDefinitions {
  [key: string]: string;
}

export interface ReportMetadata {
  columnDefinitions: ReportColumnDefinitions[];
}

export interface ReportData {
  data: { [key: string]: string }[];
  headers: ReportColumnDefinitions[];
  hasNext: boolean;
  hasPrevious: boolean;
  pageNumber: number;
  totalPages: number;
  resultSize: number;
  totalSize: number;
}

export interface ReportListFilters {
  title?: string;
  name?: string;
  tag?: string;
  moduleId?: string;
  moduleIdName?: string;
  boId?: string;
  boIdName?: string;
  formId?: string;
  formIdName?: string;
}

/** Platform 4.2+. The Report class is used to retrieve and execute TRIRIGA queries. */
export default class Report {
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
   * @param pageNumber The current page number as a zero-based value
   * @param perPage The total number of reports per page
   * @param filters The object that is used to filter the result set
   * @returns A `ReportListResults` object with the report details
   *
   * @throws Error if the query list could not be retrieved. This is caused by connectivity, session or user permission issues.
   */
  async getQueryList(
    pageNumber: number = 0,
    perPage: number = 50,
    filters?: ReportListFilters
  ): Promise<ReportListResults> {
    // Ensure that the CSRF Token is still valid
    if ((await this.auth.updateCsrfToken()) && this.auth.csrfToken) {
      const queryParams = {
        objectId: "1200000",
        actionId: "1200501",
        managerReportType: "SystemReport",
        _: "",
        reportType: "-1",
        currentPageNumber: pageNumber.toString(),
        noOfReports: perPage.toString(),
        ...filters,
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
          const results: ReportListResults = {
            totalPageCount: resp[1].TotalNumberOfPages,
            resultsPerPage: resp[1].ResultsPerPage,
            hasNextPage: resp[1].IsNext,
            hasPreviousPage: resp[1].IsPrevious,
            currentPageNumber: resp[1].currentPageNumber,
            totalCount: resp[1].TotalResultCnt,
            data: resp[0] as ReportDetails[],
          };
          return results;
        }
      }
    }

    throw new Error("Could not retrieve report list");
  }

  /**
   * Retrieves the report metadata
   *
   * @remarks
   * The report metadata will contain details surrounding the columns.
   *
   * @param templateId The unique report ID
   * @returns A `ReportMetadata` object
   *
   * @throws Error if the report is not found or if the client encounters connectivity issues.
   */
  async getReportDefinition(templateId: number): Promise<ReportMetadata> {
    const reportMetadata: ReportMetadata = { columnDefinitions: [] };
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
        reportMetadata.columnDefinitions = resp["gridConfig"]["columns"];
      }
      return reportMetadata;
    }

    throw new Error("Could not determine report metadata");
  }

  /**
   * Returns the report data for a specific page.
   *
   * @remarks
   * This method is used to retrieve data from a specific report. It will return an object that contains the data with the defined columns.
   *
   * @param templateId The unique report ID
   * @param pageNumber The current page number
   * @param pageSize The page size
   * @returns A `ReportData` object containing record details for the current page.
   *
   * @throws Error if the input is invalid or if the client encounters connectivity issues.
   */
  async getReportData(
    templateId: number,
    pageNumber = 0,
    pageSize = 50
  ): Promise<ReportData> {
    const reportMetadata = await this.getReportDefinition(templateId);

    if (reportMetadata.columnDefinitions.length > 0) {
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
        const reportData: ReportData = {
          data: resp["data"],
          headers: reportMetadata.columnDefinitions,
          hasNext: resp["result_has_next"],
          hasPrevious: resp["result_has_previous"],
          pageNumber: resp["result_page_number"],
          totalPages: resp["result_total_pages"],
          resultSize: resp["result_count"],
          totalSize: resp["result_total_size"],
        };
        return reportData;
      }

      throw new Error("Could not retrieve report data");
    }

    throw Error("Invalid report metadata");
  }

  // private generateReportFilterObject(
  //   input: ReportListFilters = {}
  // ): ReportListFilters {
  //   const filters = input;

  //   if (filters.formIdName && !filters.formId) {
  //     filters.formId = "-1";
  //   }

  //   if (filters.moduleIdName && !filters.moduleId) {
  //     filters.moduleId = "";
  //   }

  //   return filters;
  // }
}
