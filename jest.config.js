module.exports = {
  testMatch: ["<rootDir>/src/**/*.test.js"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  globals: {
    __DEV__: true,
  },
};
