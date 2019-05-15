import { createModule } from "../../module-cache";

const packagePageModule = createModule(
  () => import(/* webpackChunkName: "package-page" */ "./package-page"),
  "package-page",
);

export default packagePageModule;
