import http from "http";
import "./polyfill";

let { default: currentApp } = require("./app");
const server = http.createServer(currentApp);

server.listen(process.env.PORT, error => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Listening on http://localhost:${process.env.PORT}/`);
  }
});

if (module.hot) {
  console.log("Server-side HMR enabled");

  module.hot.accept("./app", () => {
    console.log("[HMR] Reloading...");

    try {
      const { default: nextApp } = require("./app");
      server.off("request", currentApp);
      server.on("request", nextApp);
      currentApp = nextApp;
    } catch (error) {
      console.error(error);
    }
  });
}
