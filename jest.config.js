export default {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["./jest.setup.js"]
};
