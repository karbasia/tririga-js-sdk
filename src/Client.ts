import Auth from "@/services/Auth";
import Model from "@/services/Model";
import AppConfig, { WebAppProperties } from "@/services/utils/AppConfig";

/**
 * Default client class
 */
export default class Client {
  appConfig: AppConfig;

  auth!: Auth;
  model!: Model;

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

    if (useCredentials) {
      await client.model.Init();
    }

    return client;
  }
}
