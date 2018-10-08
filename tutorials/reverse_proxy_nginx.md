# UB-server + Nginx
Рассмотрим пример работы UB-server`а в связке с Nginx-сервером в режиме [обратного прокси](https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D1%82%D0%BD%D1%8B%D0%B9_%D0%BF%D1%80%D0%BE%D0%BA%D1%81%D0%B8).  Зaпросы клиента Nginx будет перенаправлять на сервер UB, и наоборот от UB к клиенту. Для этого нужно сконфигурировать UB и Nginx.

### UBconfig
Пример конфига UB сервера:

```js
{
  "httpServer": {
    "reverseProxy": {
      //Server type. At this moment only "nginx" is supported
      "kind": "nginx",
      //Custom HTTP header containing the real client IP
      //Using for correct logging, otherwise 127.0.0.1 will be instead of user IP
      "remoteIPHeader": "X-Real-IP",
      //Send static files using reverse proxy X-Sendfile feature. For nginx should be X-Accel-Redirect
      "sendFileHeader": "X-Accel-Redirect",
      //Prefix added to the beginning of sendFileHeader location
      "sendFileLocationRoot": "ubstatic-unitybase-info"
    }
  }
}
```
### Nginx config
Конфиг для Nginx можно сгенерировать автоматически через `ubcli`:  
```
npx ubcli generateNginxCfg -out ub-proxy.conf
```  

Для генерации нужен конфиг UB сервера. Он по-умолчанию `ubConfig.json`, либо равен параметру "UB_CFG" командной строки.
Также можно передать параметром `-cfg [path]` в `ubcli`.  
```
npx ubcli generateNginxCfg -cfg ubConfig.json
```  

Полная справка и перечень параметров вызывается командой:  
`ubcli generateNginxCfg -?`

После генерации файл конфига `ub-proxy.conf` выглядит так:

```
server {
    listen       80 default_server;


    #proxy all requests to the UB backend
    location / {
        proxy_pass          http://localhost:8881;
        proxy_set_header	Host    $host;
        proxy_set_header	X-Real-IP  $realip_remote_addr;
        proxy_redirect      off;
    }
    #override client_max_body_size for setDocument endpoint
    location /setDocument {
        proxy_pass          http://localhost:8881;
        proxy_set_header	Host    $host;
        proxy_set_header	X-Real-IP  $realip_remote_addr;
        proxy_redirect      off;
        client_max_body_size    5m;
    }
    #application internal location for clientRequire, mdb, models etc
    location  /ubstatic/app {
        internal;
        alias D:/projects/unitybase-info;
    }
    #BLOB stores internal locations
    location  /ubstatic/avatars {
        internal;
        alias D:/projects/unitybase-info/blobStores/avatars/;
    }
}
```

Этот конфиг должен быть включен в nginx.conf:  
`include path/to/ub-proxy.conf;`  
или symlink в /etc/nginx/sites-enabled если вы под линуксом:
```
sudo ln -s path/to/ub-proxy.conf /etc/nginx/sites-available/default_server.cfg 
sudo ln -s /etc/nginx/sites-available/default_server.cfg /etc/nginx/sites-enabled 
sudo nginx -s reload 
```
Для удобства эти команды выводятся в консоль после генерации конфига.
 
#### Размер пересылаемых документов
По умолчанию значение параметра `client_max_body_size` (максимальный объем body POST запроса) в Nginx равно 1MB, что, скорее всего, не хватит для пересылаемых документов.
Поэтому, только для запросов, что отвечают за пересылку документов (они начинаются с `/setDocument`) можно установить свое значение.  

Статические данные могут находиться в разных местах, и для их доступа используется конструкция типа:
```
location  /ubstatic/avatars {
        internal;
        alias D:/projects/unitybase-info/blobStores/avatars/;
    }
```
Она генериуется `ubcli` на основе значений в параметре blobStores в конфигурации UB сервера. 

#### Несколько UB серверов
Для разрешения конфликтов нужно в конфиге UB сервера прописывать разные параметры `sendFileLocationRoot`.
Рекомендуется использовать шаблон типа: "ubstatic-название_проекта". Это же значение запишется при генерации в путь запроса к статическим файлам:
```
#application internal location for clientRequire, mdb, models etc
    location  /ubstatic-название_проекта/app {
        internal;
        alias D:/projects/unitybase-info;
    }
    #BLOB stores internal locations
    location  /ubstatic-название_проекта/avatars {
        internal;
        alias D:/projects/unitybase-info/blobStores/avatars/;
    }
```