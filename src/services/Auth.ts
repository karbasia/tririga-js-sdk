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

  async Login(userName: String, password: String): Promise<boolean> {
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
      const cookies: Array<string> = (req.headers as any).getSetCookie();
      if (cookies && cookies.length > 0) {
        this.sessionCookie = cookies[1];
      }
      await this.getCurrentUser();
      return this.updateCsrfToken();
    }

    return false;
  }

  async InitHeaders(): Promise<HeadersInit> {
    let headers: HeadersInit = {};

    if (await this.updateCsrfToken()) {
      headers[this.csrfToken.name] = this.csrfToken.value;
    }

    return headers;
  }

  async updateCsrfToken(): Promise<boolean> {
    if ((await this.isLoggedIn()) && this.csrfToken) {
      return true;
    }

    let reqOptions = this.generateRequestHeaders({ method: "POST" });

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

  async isLoggedIn(): Promise<boolean> {
    // Keeping a separate method in case we need to add more functionality
    return await this.checkStatus();
  }

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

  async getCurrentUser(): Promise<User> {
    if (this.currentUser && (await this.isLoggedIn())) {
      return this.currentUser;
    }

    let reqOptions: RequestInit = this.generateRequestHeaders({
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
      throw new Error("request-failed");
    }

    if (resp.ok) {
      this.currentUser = (await resp.json()) as User;
      return this.currentUser;
    }

    if (resp.status === 401) {
      throw new Error("unauthorized");
    } else {
      throw new Error("request-failed");
    }
  }

  generateRequestHeaders(additionalOptions?: RequestInit): RequestInit {
    let reqOptions: RequestInit = additionalOptions ? additionalOptions : {};

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
