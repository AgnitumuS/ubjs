// k6 run -u8 -d 10s ./getTest.js

import http from 'k6/http';
const url = 'http://localhost:8881/timestamp';
let i=0
export default function () {
  // Using a JSON string as body
  let res = http.get(url)
}