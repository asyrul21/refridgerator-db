// https://blog.logrocket.com/unit-testing-node-js-applications-using-mocha-chai-and-sinon/
const assert = require("assert");
const fs = require("fs");
const { DB } = require("../");

const SAMPLE_SECRET = "sampleSecret";
const SAMPLE_VECTOR = "sampleVector";
const SAMPLE_ENTITIES = ["categories", "comments"];

const getEntitiesMap = (entities, env = "dev") => {
  return entities.reduce((prev, curr) => {
    const dataFilePath = `${__dirname}/data/${env}/${curr}.json`;
    return {
      ...prev,
      [curr.toString()]: dataFilePath,
    };
  }, {});
};

describe("Data Read Writer: Initialisation", () => {
  it("should instantiate successfully when all valid parameters are given", () => {
    let error = null;
    try {
      DB._reset();
      DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, SAMPLE_ENTITIES, "dev", true);
    } catch (e) {
      console.log(e);
      error = e;
    }
    assert.notEqual(DB, null);
    assert.equal(error, null);
    assert.deepEqual(DB.getEntityFilesMap(), getEntitiesMap(SAMPLE_ENTITIES));
  });

  it("should instantiate successfully when module has been initialized else where", () => {
    let error = null;
    try {
      DB.initialize();
      DB.initialize();
    } catch (e) {
      console.log(e);
      error = e;
    }
    assert.notEqual(DB, null);
    assert.equal(error, null);
    assert.deepEqual(DB.getEntityFilesMap(), getEntitiesMap(SAMPLE_ENTITIES));
  });

  it("should return map data successfully when module has been initialized else where", () => {
    assert.deepEqual(DB.getEntityFilesMap(), getEntitiesMap(SAMPLE_ENTITIES));
  });

  it("should throw error when crypto secret is missing", () => {
    let error = null;
    try {
      DB._reset();
      DB.initialize(null, SAMPLE_VECTOR, SAMPLE_ENTITIES).getInstance();
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    DB._reset();
    assert.throws(() => {
      DB.initialize(null, SAMPLE_VECTOR, SAMPLE_ENTITIES).getInstance();
    });
    assert.notEqual(error, null);
  });

  it("should throw error when vector secret is missing", () => {
    let error = null;
    try {
      DB._reset();
      DB.initialize(SAMPLE_SECRET, null, SAMPLE_ENTITIES).getInstance();
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    DB._reset();
    assert.throws(() => {
      DB.initialize(SAMPLE_SECRET, null, SAMPLE_ENTITIES).getInstance();
    });
    assert.notEqual(error, null);
  });

  it("should throw error when entites array is missing", () => {
    let error = null;
    try {
      DB._reset();
      DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, null).getInstance();
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    DB._reset();
    assert.throws(() => {
      DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, null).getInstance();
    });
    assert.notEqual(error, null);
  });

  it("should throw error when entites array has length 0", () => {
    let error = null;
    try {
      DB._reset();
      DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, []).getInstance();
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    DB._reset();
    assert.throws(() => {
      DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, []).getInstance();
    });
    assert.notEqual(error, null);
  });
});

describe("Data Read Writer: Synchronized Data Writing", () => {
  before(() => {
    DB._reset();
    DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, SAMPLE_ENTITIES, null, true);
  });

  after(() => {
    DB.dropAllSync();
    DB._reset();
  });

  it("should write data to file successfully", () => {
    const categoryEntity = SAMPLE_ENTITIES[0];
    // fs.existsSync path start from start of npm module
    const filePath = `tests/data/dev/${categoryEntity}.json`;
    let error = null;
    let fileExists = false;
    try {
      DB.saveSync(categoryEntity, { name: "sampleCategory" });
      // should create file in root/data/dev/category.json
      fileExists = fs.existsSync(filePath);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.equal(error, null);
    assert.equal(fileExists, true);
    fs.unlinkSync(filePath);
  });

  it("should throw error when invalid entity is given", () => {
    const invalidEntity = "myInvalidEntity";
    const filePath = `tests/data/dev/${invalidEntity}.json`;
    let error = null;
    let fileExists = false;
    try {
      DB.saveSync(invalidEntity, { name: "sampleData" });
      fileExists = fs.existsSync(filePath);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.throws(() => {
      DB.saveSync(invalidEntity, { name: "sampleData" });
    });
    assert.notEqual(error, null);
    assert.equal(fileExists, false);
  });

  it("should throw error when invalid entity type is given", () => {
    const invalidEntity = 1234;
    const filePath = `tests/data/dev/${invalidEntity}.json`;
    let error = null;
    let fileExists = false;
    try {
      DB.saveSync(invalidEntity, { name: "sampleData" });
      fileExists = fs.existsSync(filePath);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.throws(() => {
      DB.saveSync(invalidEntity, { name: "sampleData" });
    });
    assert.notEqual(error, null);
    assert.equal(fileExists, false);
  });

  it("should throw error when DB was not initialized", () => {
    const sampleEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${sampleEntity}.json`;
    let error = null;
    try {
      DB._reset();
      DB.saveSync(sampleEntity, { name: "sampleData" });
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.throws(() => {
      DB._reset();
      DB.saveSync(sampleEntity, { name: "sampleData" });
    });
    assert.notEqual(error, null);
  });
});

describe("Data Read Writer: Asynchronous Data Writing", () => {
  before(() => {
    DB._reset();
    DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, SAMPLE_ENTITIES, null, true);
  });

  after(() => {
    DB.dropAllSync();
    DB._reset();
  });

  it("should write data to file successfully", async () => {
    const categoryEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${categoryEntity}.json`;
    let error = null;
    let fileExists = false;
    try {
      await DB.saveAsync(categoryEntity, { name: "sampleCategory" });
      fileExists = fs.existsSync(filePath);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.equal(error, null);
    assert.equal(fileExists, true);
    fs.unlinkSync(filePath);
  });

  it("should throw error when DB was not initialized", async () => {
    const sampleEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${sampleEntity}.json`;
    let error = null;
    try {
      DB._reset();
      await DB.saveAsync(sampleEntity, { name: "sampleData" });
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.notEqual(error, null);
  });
});

describe("Data Read Writer: Synchronized Data Reading", () => {
  before(() => {
    DB._reset();
    DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, SAMPLE_ENTITIES, null, true);
  });

  after(() => {
    DB.dropAllSync();
    DB._reset();
  });

  it("should read data from file successfully", () => {
    const categoryEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${categoryEntity}.json`;

    // write encrypted data first
    const sampleCategoryData = {
      name: "sampleCategory",
      description: "My sample category description",
    };
    let error = null;
    let readData;
    try {
      DB.saveSync(categoryEntity, sampleCategoryData);
      // attempt to read data
      readData = DB.readSync(categoryEntity);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.equal(error, null);
    assert.deepStrictEqual(sampleCategoryData, readData);
    fs.unlinkSync(filePath);
  });

  it("should throw error when DB was not initialized", () => {
    let readData;
    const sampleEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${sampleEntity}.json`;
    let error = null;
    try {
      DB._reset();
      readData = DB.readSync(sampleEntity, { name: "sampleData" });
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.notEqual(error, null);
  });
});

describe("Data Read Writer: Asynchronous Data Reading", () => {
  before(() => {
    DB._reset();
    DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, SAMPLE_ENTITIES, null, true);
  });

  after(() => {
    DB.dropAllSync();
    DB._reset();
  });

  it("should write data to file successfully", async () => {
    const categoryEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${categoryEntity}.json`;

    // write encrypted data first
    const sampleCategoryData = {
      name: "sampleCategory",
      description: "My sample category description",
    };
    let error = null;
    let readData;
    try {
      DB.saveSync(categoryEntity, sampleCategoryData);
      // attempt to read data
      readData = await DB.readAsync(categoryEntity);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.equal(error, null);
    assert.deepStrictEqual(sampleCategoryData, readData);
    fs.unlinkSync(filePath);
  });

  it("should throw error when DB was not initialized", async () => {
    let readData;
    const sampleEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/dev/${sampleEntity}.json`;
    let error = null;
    try {
      DB._reset();
      readData = await DB.readAsync(sampleEntity, { name: "sampleData" });
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.notEqual(error, null);
  });
});

describe("Data Read Writer: Reading and writing in different environments", () => {
  before(() => {
    DB._reset();
    DB.initialize(SAMPLE_SECRET, SAMPLE_VECTOR, SAMPLE_ENTITIES, "prod", true);
  });

  after(() => {
    DB.dropAllSync();
    DB._reset();
  });

  it("should write and read data successfully in prod environment", async () => {
    const categoryEntity = SAMPLE_ENTITIES[0];
    const filePath = `tests/data/prod/${categoryEntity}.json`;
    // write encrypted data first
    const sampleCategoryData = {
      name: "sampleCategory",
      description: "My sample category description",
    };
    let error = null;
    let readData;
    let fileExists;
    try {
      DB.saveSync(categoryEntity, sampleCategoryData);
      fileExists = fs.existsSync(filePath);
      readData = await DB.readAsync(categoryEntity);
    } catch (e) {
      console.log(`ERROR: ${e.message || e}`);
      error = e;
    }
    assert.equal(error, null);
    assert.equal(fileExists, true);
    assert.deepStrictEqual(sampleCategoryData, readData);
    fs.unlinkSync(filePath);
  });
});
