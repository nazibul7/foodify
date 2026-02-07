
// For reference see https://github.com/Huzaifa-Asif/Load-Test-Backend-With-K6/blob/master/1-smoke-test.js

// Is my fronted rachable or not like frontend server up or initial HTML loads or not

import http from "k6/http"
import { check } from "k6"
import { config } from "../helpers/config.js";

export default function () {
    const res = http.get(config.FRONTEND_URL);
    console.log("GET", config.FRONTEND_URL, "→ status:", res.status);
    check(res, { 'status is 200': (r) => r.status === 200 });
}