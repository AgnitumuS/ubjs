#curl --request POST \
#  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/79.0.3945.79 Chrome/79.0.3945.79 Safari/537.36" \
#  -H "Connection: keep-alive" \
#  -H "Accept-Encoding: gzip, deflate" \
#  -H "Accept: application/json, text/plain, */*" \
#  -d 'data' \
#  --url 'http://localhost:8881/auth' #\
##  --output './path/to/file'
cd ../../../apps/autotest
#npx ubcli createStore -cfg ubConfigDev.json &&
#  npx ubcli initDB -p admin -drop -create -dba postgres -dbaPwd postgres -cfg ubConfigDev.json &&
#  npx ubcli generateDDL -autorun -host http://localhost:8881 -cfg ubConfigDev.json && #
#  npx ubcli initialize -u admin -p admin -host http://localhost:8881 -cfg ubConfigDev.json # -debug

#curl --request GET --url 'http://localhost:8881/getAppInfo'
#curl --request GET --url 'http://localhost:8881/getDomainInfo?userName=anonymous&v=4'

curl --request POST \
  --output 5.txt --data-urlencode \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/79.0.3945.79 Chrome/79.0.3945.79 Safari/537.36" \
  -H "Connection: keep-alive" \
  -H "Accept-Encoding: gzip, deflate, br" \
  -H "Content-Length: 378" \
  -H "Accept: application/json, text/plain, */*" \
  -H "Content-Type: application/json;charset=UTF-8" \
  -d '[{"entity":"ubm_navshortcut","method":"select","fieldList":["ID","desktopID","parentID","code","isFolder","caption","inWindow","isCollapsed","displayOrder","iconCls","mi_modifyDate"],"orderList":{"0":{"expression":"desktopID","order":"asc"},"1":{"expression":"parentID","order":"asc"},"2":{"expression":"displayOrder","order":"asc"},"3":{"expression":"caption","order":"asc"}}}]' \
  --url 'http://localhost:8881/ubql' #\
