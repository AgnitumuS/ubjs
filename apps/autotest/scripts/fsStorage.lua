-- call a POST method for ubm_form from wrk
-- UB must be without authentication (authenticationMethods: [])
-- wrk -t10 -c20 -d10s -s ./fsStorage.lua http://localhost:8881/ubql
wrk.method = "POST"
wrk.body   = '[{"entity":"ubm_form","method":"select","fieldList":["ID","entity","code","description","caption","formType","isDefault"],"version":2816382022}]'
wrk.headers["Content-Type"] = "application/json;charset=UTF-8"
wrk.headers["Connection"] = "keep-alive"