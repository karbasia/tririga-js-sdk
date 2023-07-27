import { AppConfig, Auth, WebAppProperties } from "@/index";

describe('Auth test cases', () => {

  const appProperties: WebAppProperties = {
    instanceId: "-1",
    appLabel: "triRoomReservationWebApp",
    contextPath: "",
    modelAndView: "triRoomReservationWebApp",
    appPath: "/app/tririgaRoomReservation",
    sso: false,
    appExposedName: "tririgaRoomReservation",
    tririgaRoot: "https://www.karbasi.dev", 
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ csrfToken: 'ABC123', url: appProperties.appPath }),
        text: () => Promise.resolve('active'),
        headers: new Headers({ "Set-Cookie": "JSESSIONID=123123" }),
        ok: true,
      })
    ) as jest.Mock;
  });

  test('Check if logged in via browser', async () => {
    const appConfig = new AppConfig(appProperties);
    const auth = new Auth(appConfig, true);

    const isLoggedIn = await auth.isLoggedIn();

    expect(global.fetch).toHaveBeenCalled();
    expect(isLoggedIn).toBe(true);
  });

  test('Log in using credentials', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ url: appProperties.appPath, csrfToken: 'sample-data' }),
        text: () => Promise.resolve('expired'),
        headers: new Headers({ "Set-Cookie": "JSESSIONID=123123" }),
        ok: true,
      })
    ) as jest.Mock;

    const appConfig = new AppConfig(appProperties);
    const auth = new Auth(appConfig, false);

    const isLoggedIn = await auth.Login('amir', 'karbasi');

    expect(global.fetch).toHaveBeenCalled();
    expect(isLoggedIn).toBe(true);
  });

  test('Call login after being already logged in', async () => {
    const appConfig = new AppConfig(appProperties);
    const auth = new Auth(appConfig, false);

    const isLoggedIn = await auth.Login('valid', 'credentials');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(isLoggedIn).toBe(true);
  });

  test('Check logged in status without a session', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('expired'),
        ok: false,
      })
    ) as jest.Mock;

    const appConfig = new AppConfig(appProperties);
    const auth = new Auth(appConfig, true);

    const isLoggedIn = await auth.isLoggedIn();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(isLoggedIn).toBe(false);
  });

  test('Check logged in status without a session', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'invalid login' }),
        text: () => Promise.resolve('expired'),
        ok: false,
      })
    ) as jest.Mock;

    const appConfig = new AppConfig(appProperties);
    const auth = new Auth(appConfig, false);

    const isLoggedIn = await auth.Login('invalid', 'credentials');

    expect(global.fetch).toHaveBeenCalled();
    expect(isLoggedIn).toBe(false);
  });

});