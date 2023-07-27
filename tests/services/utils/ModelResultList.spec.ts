import { BaseRecord, ModelResultList } from "@/index";

describe('Model Result List', () => {

  interface PeopleRecord extends BaseRecord {
    id: string,
    name: string
  }
  
  test('Initialize an empty model result list', () => {
    let newResultSet = new ModelResultList();

    expect(newResultSet.data).toBeInstanceOf(Array);
    expect(newResultSet.data).toHaveLength(0);
    expect(newResultSet.from).toBeUndefined();
    expect(newResultSet.hasMoreResults).toBeUndefined();
    expect(newResultSet.size).toBeUndefined();
    expect(newResultSet.totalSize).toBeUndefined();
  });

  test('Initialize data based on a sample response', () => {
    const sampleResponse = {
      totalSize: 2,
      data: [
      {
        _id: "10847293",
        id: "10000",
        name: "Amir"
      },
      {
        _id: "10847294",
        id: "10001",
        name: "Karbasi"
      }],
      size: 2,
      hasMoreResults: false,
      from: -1
    };

    const resultSet = new ModelResultList<PeopleRecord>(
      sampleResponse.totalSize,
      sampleResponse.size,
      sampleResponse.hasMoreResults,
      sampleResponse.from,
      sampleResponse.data as PeopleRecord[]
    );

    expect(resultSet).toBeInstanceOf(ModelResultList);
    expect(resultSet.data).toHaveLength(sampleResponse.data.length);
    expect(resultSet.from).toBe(sampleResponse.from);
    expect(resultSet.hasMoreResults).toBe(sampleResponse.hasMoreResults);
    expect(resultSet.size).toBe(sampleResponse.size);
    expect(resultSet.totalSize).toBe(sampleResponse.totalSize);

  });

});