import { URL, URLSearchParams } from "url";
import fetch from "node-fetch";

global.URL = URL;
global.URLSearchParams = URLSearchParams;
global.fetch = fetch;
