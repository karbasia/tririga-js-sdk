/**
 * @jest-environment jsdom
 */

import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks();

import Client, { WebAppProperties } from "@/index";

describe("Core Client Tests", () => {
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
        headers: new Headers({ "Set-Cookie": "JSESSIONID=123123", "triWebContextId": "ABC123" }),
        ok: true,
      })
    ) as jest.Mock;
  });

  test("Initiate Client Via Web App", async () => {
    Object.defineProperty(window, 'location', {
      value: new URL(appProperties.tririgaRoot || '')
    });

    const client = await Client.CreateClient(true, appProperties);

    expect(client).toBeInstanceOf(Client);
    expect(client.auth).toBeDefined();
    expect(client.model).toBeDefined();
    expect(client.model.webContextId).toBe("ABC123");
  });

  test("Initiate Client Without Credentials", async () => {

    // Do not set window object by default
    Reflect.deleteProperty(global.window, 'location');

    const client = await Client.CreateClient(false, appProperties);

    expect(client).toBeInstanceOf(Client);
    expect(client.auth).toBeDefined();
    expect(client.model).toBeDefined();
    expect(client.model.webContextId).toBeUndefined();
  });
})