import { URLSearchParams } from "url";
import fetch from "node-fetch";

global.URLSearchParams = URLSearchParams;
global.fetch = fetch;
