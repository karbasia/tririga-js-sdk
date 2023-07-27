export interface WebAppProperties {
  tririgaRoot?: string;
  contextPath: string;
  appPath: string;
  appExposedName: string;
  instanceId: string;
  modelAndView: string;
  sso: boolean;
  appLabel: string;
}

export default class AppConfig {
  tririgaUrl: string;

  contextPath: string;

  appPath: string;

  appExposedName: string;

  instanceId: string;

  modelAndView: string;

  sso: boolean;

  appLabel: string;

  constructor(settings: WebAppProperties) {
    this.contextPath = settings.contextPath;
    this.appPath = settings.appPath;
    this.appExposedName = settings.appExposedName;
    this.instanceId = settings.instanceId;
    this.modelAndView = settings.modelAndView;
    this.sso = settings.sso;
    this.appLabel = settings.appLabel;

    if (settings.tririgaRoot) {
      this.tririgaUrl = `${settings.tririgaRoot}${this.contextPath}`;
    } else if (typeof window !== "undefined" && window.location) {
      this.tririgaUrl = `${window.location.origin}${this.contextPath}`;
    } else {
      throw new Error("Could not determine TRIRIGA server URL");
    }
  }

  static async Init(webAppProperties?: WebAppProperties): Promise<AppConfig> {
    if (webAppProperties) {
      try {
        const appConfig = new AppConfig(webAppProperties);
        return appConfig;
      } catch (err) {
        console.warn(
          "Could not configure application based on user-defined settings",
          err
        );
      }
    }

    // Fall back on retrieving the config from the server
    const prodAppConfigJson = await fetch("tri-app-config.json");

    if (prodAppConfigJson.ok) {
      const prodAppProperties: WebAppProperties =
        await prodAppConfigJson.json();
      return new AppConfig(prodAppProperties);
    }

    throw new Error("Could not determine application properties");
  }
}
