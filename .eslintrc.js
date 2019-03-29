module.exports = {
  extends: ["react-app"],
  plugins: ["react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  globals: {
    __DEV__: "readonly",
  },
};
