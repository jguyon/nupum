import invariant from "tiny-invariant";
import { IS_MODULE, MODULE_FETCH } from "./constants";

export default function createModule(fetch) {
  invariant(typeof fetch === "function", "expected fetch to be a function");

  const module = {
    [IS_MODULE]: true,
    [MODULE_FETCH]: fetch,
  };

  return module;
}
