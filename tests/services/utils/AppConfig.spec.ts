/**
 * @jest-environment jsdom
 */

import { AppConfig, WebAppProperties } from '@/index';

describe('AppConfig tests', () => {

  let appProperties: WebAppProperties;

  const url = 'https://www.karbasi.dev';

  beforeEach(() => {
    appProperties = {
      instanceId: "-1",
      appLabel: "triRoomReservationWebApp",
      contextPath: "",
      modelAndView: "triRoomReservationWebApp",
      appPath: "/app/tririgaRoomReservation",
      sso: false,
      appExposedName: "tririgaRoomReservation"
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: false,
      })
    ) as jest.Mock;
  });

  test('Read config off server properties', async () => {

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(appProperties),
        ok: true,
      })
    ) as jest.Mock;
    
    Object.defineProperty(window, 'location', {
      value: new URL(url)
    });

    const appConfig = await AppConfig.Init();
    
    expect(appConfig.instanceId).toEqual(appProperties.instanceId);
    expect(appConfig.appLabel).toEqual(appProperties.appLabel);
    expect(appConfig.contextPath).toEqual(appProperties.contextPath);
    expect(appConfig.modelAndView).toEqual(appProperties.modelAndView);
    expect(appConfig.appPath).toEqual(appProperties.appPath);
    expect(appConfig.sso).toEqual(appProperties.sso);
    expect(appConfig.appExposedName).toEqual(appProperties.appExposedName);
    expect(appConfig.tririgaUrl).toEqual(`${url}${appProperties.contextPath}`);
  });

  test('Configuration based on user-defined settings', async () => {

    let userSettings : WebAppProperties = appProperties;

    // Set up a different URL for this test and ensure that it's being used in the config
    userSettings.tririgaRoot = 'https://tririga.karbasi.dev';

    const appConfig = await AppConfig.Init(userSettings);

    expect(appConfig.instanceId).toEqual(userSettings.instanceId);
    expect(appConfig.appLabel).toEqual(userSettings.appLabel);
    expect(appConfig.contextPath).toEqual(userSettings.contextPath);
    expect(appConfig.modelAndView).toEqual(userSettings.modelAndView);
    expect(appConfig.appPath).toEqual(userSettings.appPath);
    expect(appConfig.sso).toEqual(userSettings.sso);
    expect(appConfig.appExposedName).toEqual(userSettings.appExposedName);
    expect(appConfig.tririgaUrl).toEqual(`${userSettings.tririgaRoot}${userSettings.contextPath}`);
  });

  test('Verify that all required values are provided', async () => {

    console.warn = jest.fn();

    // Do not set window object by default
    Reflect.deleteProperty(global.window, 'location');

    const userSettings : WebAppProperties = appProperties;

    await expect(AppConfig.Init(userSettings))
      .rejects
      .toThrow('Could not determine application properties');
      
    expect(console.warn).toHaveBeenCalled();

  });

});