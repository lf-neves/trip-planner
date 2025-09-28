import { setupTestData } from "./setupTestData";

export { faker } from "shared-libs";
export { default as request } from "supertest";

type TestData = Awaited<ReturnType<typeof setupTestData>>;
export { setupTestData, type TestData };
