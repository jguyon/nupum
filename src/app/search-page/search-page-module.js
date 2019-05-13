import { createModule } from "../../module-cache";

const searchPageModule = createModule(
  () => import(/* webpackChunkName: "search-page" */ "./search-page"),
  "search-page",
);

export default searchPageModule;
