
// For reference see https://github.com/Huzaifa-Asif/Load-Test-Backend-With-K6/blob/master/1-smoke-test.js

import http from "k6/http"
import { check } from "k6"
import { config } from "../helpers/config";

export { options } from "../helpers/baseline.config.js"

export default function () {
    const res = http.get(config.BASE_URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
}