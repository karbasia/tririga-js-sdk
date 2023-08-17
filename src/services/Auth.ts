import AppConfig from "@/services/utils/AppConfig";

export interface User {
  fullName: string;
  languageId: number;
  userDirection: "ltr" | "rtl";
  userId: number;
}

interface csrfToken {
  name: string;
  value: string;
}

/** Platform 3.8+. The default class for managing the user session. */
export default class Auth {
  appConfig: AppConfig;
  useCredentials: boolean;

  currentUser!: User;

  csrfToken!: csrfToken;

  sessionCookie!: string;

  constructor(appConfig: AppConfig, useCredentials: boolean) {
    this.appConfig = appConfig;
    this.useCredentials = useCredentials;
  }

  /**
   * Basic non-SSO client authentication.
   *
   * @remarks
   * This method is only supported on non-SSO instances. On succesful login, the application will set up the current user context, cookie and csrf token for future API calls.
   * To use this method with an SSO environment, please utilize a non-SSO proc server.
   *
   * @param userName TRIRIGA username
   * @param password TRIRIGA password
   * @returns `true` if the login was successful and `false` if login failed.
   */
  async Login(userName: string, password: string): Promise<boolean> {
    if (await this.isLoggedIn()) {
      return true;
    }

    const reqHeaders = new Headers();
    reqHeaders.append("Content-Type", "application/json");

    const reqOptions = this.generateRequestHeaders({
      headers: reqHeaders,
      method: "POST",
      body: JSON.stringify({ userName, password }),
    });
    const req = await fetch(
      `${this.appConfig.tririgaUrl}/p/websignon/tririga-login`,
      reqOptions
    );

    if (req.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cookies: Array<string> = (req.headers as any).getSetCookie();
      if (cookies && cookies.length > 0) {
        this.sessionCookie = cookies[1];
      }
      await this.getCurrentUser();
      return this.updateCsrfToken();
    }

    return false;
  }

  /**
   * Helper method to check the csrf token and return a starter headers object.
   *
   * @remarks
   * This is used by other functions in the library as a starter header for API calls.
   *
   * @returns `HeadersInit` object with the csrf token.
   */
  async InitHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {};

    if (await this.updateCsrfToken()) {
      headers[this.csrfToken.name] = this.csrfToken.value;
    }

    return headers;
  }

  /**
   * Helper method to check and update the csrf token.
   *
   * @remarks
   * The token must be updated if the session is updated. The token is used for certain API calls.
   *
   * @returns `true` if the csrf token is valid and `false` if it is not.
   */
  async updateCsrfToken(): Promise<boolean> {
    if ((await this.isLoggedIn()) && this.csrfToken) {
      return true;
    }

    const reqOptions = this.generateRequestHeaders({ method: "POST" });

    const resp = await fetch(
      `${this.appConfig.tririgaUrl}/api/v1/session/update-csrf-token`,
      reqOptions
    );

    if (resp.ok) {
      const results = await resp.json();
      this.csrfToken = results["csrfToken"] as csrfToken;
    }

    return resp.ok;
  }

  /**
   * Simple method to verify that the session is valid.
   *
   * @remarks
   * Currently this is identical to `checkStatus()`.
   *
   * @returns `true` if the session is valid and `false` if the session is no longer valid.
   */
  async isLoggedIn(): Promise<boolean> {
    // Keeping a separate method in case we need to add more functionality
    return await this.checkStatus();
  }

  /**
   * Verify that the session is still active.
   *
   * @remarks
   * This method can be used to verify whether the client must reauthenticate their session.
   *
   * @returns `true` if the session is valid and `false` if the session is no longer valid.
   */
  async checkStatus(): Promise<boolean> {
    const reqOptions: RequestInit = this.generateRequestHeaders();
    const resp = await fetch(
      `${this.appConfig.tririgaUrl}/api/v1/session/status`,
      reqOptions
    );

    if (resp.ok) {
      const respStatus = await resp.text();
      return respStatus === "active";
    }

    return false;
  }

  /**
   * Retrieves the logged in user details.
   *
   * @remarks
   * Basic profile details are provided with the `User` object.
   *
   * @returns A `User` object with the current user's basic profile details and preferences.
   *
   * @throws Error if the user details could not be retrieved. The Error object will include details about the error.
   */
  async getCurrentUser(): Promise<User> {
    if (this.currentUser && (await this.isLoggedIn())) {
      return this.currentUser;
    }

    const reqOptions: RequestInit = this.generateRequestHeaders({
      method: "GET",
      cache: "no-cache",
    });

    let resp: Response;
    try {
      resp = await fetch(
        `${this.appConfig.tririgaUrl}/p/webapi/current-user`,
        reqOptions
      );
    } catch (err) {
      throw new Error(`Request Failed. ${err}`);
    }

    if (resp.ok) {
      this.currentUser = (await resp.json()) as User;
      return this.currentUser;
    }

    if (resp.status === 401) {
      throw new Error("Unauthorized");
    } else {
      throw new Error(`Request Failed. Status code: ${resp.status}`);
    }
  }

  /**
   * A helper method for building the basic request options object.
   *
   * @remarks
   * This method is used to append the required cookie and useCredentials values to the request options.
   *
   * @param additionalOptions Custom request options from the caller
   * @returns A `RequestInit` object with the required headers and user specified options.
   */
  generateRequestHeaders(additionalOptions?: RequestInit): RequestInit {
    const reqOptions: RequestInit = additionalOptions ? additionalOptions : {};

    if (this.useCredentials) {
      reqOptions.credentials = "include";
    } else {
      reqOptions.headers = {
        ...reqOptions.headers,
        Cookie: this.sessionCookie,
      };
    }

    return reqOptions;
  }
}
