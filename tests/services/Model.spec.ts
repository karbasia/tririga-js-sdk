import { AppConfig, Auth, BaseRecord, Model, ModelResultList, WebAppProperties } from "@/index";

interface JestRecord extends BaseRecord {
  name: string,
  id: string,
  testResults: string,
};

describe("Model test cases", () => {

  let appProperties: WebAppProperties;
  let appConfig: AppConfig;
  let auth: Auth;
  const testHeaders = new Headers({ "Set-Cookie": "JSESSIONID=123123", "triWebContextId": "ABC123" });

  const testRecord1: JestRecord = {
    name: "First",
    id: "10000",
    testResults: "PASS",
    _id: "999"
  };

  const testRecord2: JestRecord = {
    name: "Second",
    id: "10001",
    testResults: "PASS",
    _id: "1002"
  };

  appProperties = {
    instanceId: "-1",
    appLabel: "triRoomReservationWebApp",
    contextPath: "",
    modelAndView: "triRoomReservationWebApp",
    appPath: "/app/tririgaRoomReservation",
    sso: false,
    appExposedName: "tririgaRoomReservation",
    tririgaRoot: "https://www.karbasi.dev", 
  }

  appConfig = new AppConfig(appProperties);
  auth = new Auth(appConfig, true);

  describe("Base tests", () => {
    test("Initialize Successfully", async () => {

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ csrfToken: 'ABC123', url: appProperties.appPath }),
          text: () => Promise.resolve('active'),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
  
      await model.Init();
  
      expect(model.webContextId).toBe("ABC123");
    });
  
    test("Invalid Session", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({  url: appProperties.appPath }),
          text: () => Promise.resolve('inactive'),
          status: 401,
          ok: false,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
  
      await expect(model.Init())
        .rejects
        .toThrowError();
    });
  });

  describe("Model.getRecord", () => {
    test("Get Single Record", async () => {

      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve({ data: testRecord1 }),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();

      const response: ModelResultList<JestRecord> = await model.getRecord("/tests/1");
  
      expect(response.from).toBeUndefined();
      expect(response.size).toBeUndefined();
      expect(response.hasMoreResults).toBeUndefined();
      expect(response.totalSize).toBeUndefined();
      expect(response.data).toHaveProperty("_id");
      expect(response.data).toMatchObject(testRecord1);
  
    });

    test("Get Multiple Records", async () => {

      const respObj = {
        from: 0,
        size: 2,
        hasMoreResults: false,
        totalSize: 2,
        data: [testRecord1, testRecord2]
      }
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(respObj),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();

      const response: ModelResultList<JestRecord> = await model.getRecord("/tests/2");
  
      expect(response.from).toBe(0);
      expect(response.size).toBe(2);
      expect(response.hasMoreResults).toBe(false);
      expect(response.totalSize).toBe(2);
      expect(response.data).toHaveLength(2);
      expect(response).toMatchObject(respObj);
  
    });
  });

  describe("Model.addRecord", () => {
    test("Add Record Without Refresh", async () => {
      const testResp = {
        wfParametersMap: null
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
      
      const resp = await model.addRecord("/test", "1000000");
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toBeUndefined();
    });
  
    test("Add Record With Refresh", async () => {
      const testResp = {
        wfParametersMap: null,
        refresh: {
          from: 0,
          totalSize: 1,
          size: 1,
          actionName: null,
          wfParametersMap: null,
          data: [testRecord1]
        }
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.addRecord("/test", "1000000", "default", "associate", null, true);
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toHaveProperty("from");
      expect(resp.refresh).toHaveProperty("totalSize");
      expect(resp.refresh).toHaveProperty("size");
      expect(resp.refresh).toHaveProperty("actionName");
      expect(resp.refresh).toHaveProperty("wfParametersMap");
      expect(resp.refresh).toHaveProperty("data");
      expect(resp.refresh?.data).toHaveLength(1);
    });
  });

  describe("Model.createRecord", () => {
    test("Create Single Record", async () => {
      const testResp = {
        createdRecordId: "10000",
        wfParametersMap: null
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: new Headers(testHeaders),
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.createRecord<JestRecord>("/test", testRecord1, "default", "createHidden");
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toBeUndefined();
      expect(resp.createdRecordId).toBe(testResp.createdRecordId);
      expect(resp.createdRecordIds).toBeUndefined();
    });
  
    test("Create Multiple Records", async () => {
      const testResp = {
        createdRecordIds: ["10000", "10001"],
        wfParametersMap: null
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: new Headers(testHeaders),
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.createRecord<JestRecord>("/test", [testRecord1, testRecord2], "default", "createHidden");
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toBeUndefined();
      expect(resp.createdRecordId).toBeUndefined;
      expect(resp.createdRecordIds).toHaveLength(2);
    });
  });

  describe("Model.performAction", () => {
    test("Perform Action Without Refresh", async () => {
      const testResp = {
        wfParametersMap: null
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
      
      const resp = await model.performAction("/test", ["1000000", "1000001"]);
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toBeUndefined();
    });
  
    test("Perform Action With Refresh", async () => {
      const testResp = {
        wfParametersMap: null,
        refresh: {
          from: 0,
          totalSize: 1,
          size: 1,
          actionName: null,
          wfParametersMap: null,
          data: [testRecord1]
        }
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.performAction("/test", "1000000", "default", "activate", null, true);
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toHaveProperty("from");
      expect(resp.refresh).toHaveProperty("totalSize");
      expect(resp.refresh).toHaveProperty("size");
      expect(resp.refresh).toHaveProperty("actionName");
      expect(resp.refresh).toHaveProperty("wfParametersMap");
      expect(resp.refresh).toHaveProperty("data");
      expect(resp.refresh?.data).toHaveLength(1);
    });
  });

  describe("Model.removeRecord", () => {
    test("Remove Record Without Refresh", async () => {
      const testResp = {
        wfParametersMap: null
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
      
      const resp = await model.removeRecord("/test", ["1000000", "1000001"]);
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toBeUndefined();
    });
  
    test("Remove Record With Refresh", async () => {
      const testResp = {
        wfParametersMap: null,
        refresh: {
          from: 0,
          totalSize: 2,
          size: 2,
          actionName: "deassociate",
          wfParametersMap: null,
          data: [testRecord1, testRecord2]
        }
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: testHeaders,
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.removeRecord("/test", ["1000000", "1000001"], "default", "deassociate", null, true);
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toHaveProperty("from");
      expect(resp.refresh).toHaveProperty("totalSize");
      expect(resp.refresh).toHaveProperty("size");
      expect(resp.refresh).toHaveProperty("actionName");
      expect(resp.refresh).toHaveProperty("wfParametersMap");
      expect(resp.refresh).toHaveProperty("data");
      expect(resp.refresh?.data).toHaveLength(2);
    });
  });

  describe("Model.updateRecord", () => {
    test("Update Single Record", async () => {
      const testResp = {
        wfParametersMap: null
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: new Headers(testHeaders),
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.updateRecord<JestRecord>("/test", testRecord1, "default", "save");
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toBeUndefined();
    });
  
    test("Update Multiple Records", async () => {
      const testResp = {
        wfParametersMap: null,
        refresh: {
          from: 0,
          totalSize: 2,
          size: 2,
          actionName: "save",
          wfParametersMap: null,
          data: [testRecord1, testRecord2]
        }
      };
  
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve(testResp),
          headers: new Headers(testHeaders),
          ok: true,
        })
      ) as jest.Mock;
  
      const model = new Model(appConfig, auth);
      await model.Init();
  
      const resp = await model.createRecord<JestRecord>("/test", [testRecord1, testRecord2], "default", "save", null, true);
  
      expect(resp.wfParametersMap).toBeNull();
      expect(resp.refresh).toHaveProperty("from");
      expect(resp.refresh).toHaveProperty("totalSize");
      expect(resp.refresh).toHaveProperty("size");
      expect(resp.refresh).toHaveProperty("actionName");
      expect(resp.refresh).toHaveProperty("wfParametersMap");
      expect(resp.refresh).toHaveProperty("data");
      expect(resp.refresh?.data).toHaveLength(2);
    });
  });

});