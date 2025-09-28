const { readFileSync } = require("fs");
const path = require("path");
const { pathsToModuleNameMapper } = require("ts-jest");

const tsconfig = JSON.parse(
  readFileSync(path.resolve(__dirname, "tsconfig.json"), "utf-8")
);

/** @type {import("jest").Config} */
const config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  rootDir: ".",
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
    "^.+\\.[j]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/lambda/node_modules/(?!p-map)"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths || {},
    { prefix: "<rootDir>/" }
  ),
  setupFilesAfterEnv: ["<rootDir>/setupTestAfterEnv.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
};

module.exports = config;
