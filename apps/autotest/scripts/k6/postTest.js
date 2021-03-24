// k6 run -u8 -d 10s ./postTest.js

import http from 'k6/http';
const url = 'http://localhost:8881/bodyJson';
let i=0
export default function () {
  let data = [{"entity":"ubm_form","method":"select","fieldList":["ID","entity","code","description","caption","formType","isDefault"],"version":2816382022,"n": i++}]
  // Using a JSON string as body
  let res = http.post(url, JSON.stringify(data),
                      { headers: { 'Content-Type': 'application/json' } });
}