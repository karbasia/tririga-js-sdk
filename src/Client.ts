import Auth from "@/services/Auth";
import Model from "@/services/Model";
import AppConfig, { WebAppProperties } from "@/services/utils/AppConfig";

export default class Client {
  appConfig: AppConfig;

  auth!: Auth;
  model!: Model;

  constructor(appConfig: AppConfig) {
    this.appConfig = appConfig;
  }

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
