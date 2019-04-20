module.exports = {
  testMatch: ["<rootDir>/src/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  watchPathIgnorePatterns: ["<rootDir>/build/"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
    "jest-watch-master",
  ],
  globals: {
    __DEV__: true,
  },
};
