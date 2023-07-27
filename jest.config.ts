import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!variables/.*)"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  verbose: false,
  resetMocks: true,
  clearMocks: true,
};

export default config;
