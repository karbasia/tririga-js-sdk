import Auth from "@/services/Auth";
import Model from "@/services/Model";
import Report from "@/services/Report";
import AppConfig, { WebAppProperties } from "@/services/utils/AppConfig";

/**
 * Default client class
 */
export default class Client {
  appConfig: AppConfig;

  auth!: Auth;
  model!: Model;
  report!: Report;

  /** @hidden */
  constructor(appConfig: AppConfig) {
    this.appConfig = appConfig;
  }

  /**
   * The main entrypoint to the client
   *
   * @remarks
   * The client will be used to interact with TRIRIGA. It must be initialized prior to any system calls.
   *
   * @param useCredentials Set to `true` to include the useCredentials header (used by browser clients)
   * @param webAppProperties The TRIRIGA environment properties object
   * @returns An instance of the `Client` object
   *
   * @alpha
   */
  static async CreateClient(
    useCredentials = false,
    webAppProperties?: WebAppProperties
  ): Promise<Client> {
    const appConfig = await AppConfig.Init(webAppProperties);
    const client = new Client(appConfig);

    client.auth = new Auth(appConfig, useCredentials);
    client.model = new Model(appConfig, client.auth);
    client.report = new Report(appConfig, client.auth);

    if (useCredentials) {
      await client.model.Init();
    }

    return client;
  }

  /**
   * Initialize the client using an existing JSESSIONID.
   *
   * @remarks
   * This method validates the session by calling `getCurrentUser()`. If the session is invalid or expired, it will throw an error.
   * On success, the client is fully initialized with the user context, CSRF token, and web context ID.
   *
   * @param sessionId The JSESSIONID value
   * @param webAppProperties The TRIRIGA environment properties object
   * @returns An instance of the `Client` object
   */
  static async CreateClientWithSessionId(
    sessionId: string,
    webAppProperties?: WebAppProperties
  ): Promise<Client> {
    const appConfig = await AppConfig.Init(webAppProperties);
    const client = new Client(appConfig);

    client.auth = new Auth(appConfig, false);
    client.auth.sessionCookie = `JSESSIONID=${sessionId}`;

    await client.auth.getCurrentUser();
    await client.auth.updateCsrfToken();

    client.model = new Model(appConfig, client.auth);
    client.report = new Report(appConfig, client.auth);

    await client.model.Init();

    return client;
  }
}
