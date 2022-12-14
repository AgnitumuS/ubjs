[[toc]]

# Using Nginx as a reverse proxy and load balance
![load balance](img/LoadBalancing.png)

Using some kind of [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) 
in combination with UnityBase application server is MUST HAVE for plain socket based HTTP server kind (Linux, Windows) and optional
but strongly recommended for HTTP.SYS based http server (Windows).
    
Reverse proxy can be used to:
 - HTTP protocol verification and prevention of protocol level attacks
 - TLS termination
 - handling static files (with gziping, streaming, partial downloads, cache)
 - load balancing (with sticky sessions `ip_hash` for example)
 - request body size limitation
 - geo-ip filtering
 - rate limit (limit the amount of HTTP requests a user can make in a given period of time) 
 - etc.
 
Below we describe how to configure nginx as a reverse proxy for ub 

## Configuring UnityBase application

In the application config (ubConfig.json) add `externalURL` and `reverseProxy` keys:  
```json
{
  "httpServer": {
    "externalURL": "https://myapp.mydomain.com",
    "reverseProxy": {"kind": "nginx"}
  }
}
```

`externalURL` is address of your application for the end-user (address they type in browser)
 
## Serving static assets by nginx
UnityBase itself can server a static assets - files placed in
 - models public folders (available using `/models` endpoint)
 - application node_modules folder (available using `/clientRequire` endpoint on server and calls to `require()` and `System.import()` on client)   

This is useful on development stage, but on production stage we highly recommend to allow nginx to server a static assets. 

Serving static by nginx improves:
 - user experience during application loads: while UB servers a API requests nginx can serve static 
 - decrease a UB logs size
 - decrease a overall load for UB server (approximately 0.5ms for each static file)

### Prepare application for serving static by nginx

  - define `httpServer.inetPub` parameter in config. This is a folder where static files will be stored. Usually = `./itetpub`
  - run a command `ubcli linkStatic`. This command creates a `.linkStatic.sh` script for sym-linking a static asset into `inetPub` folder
  - execute a `.linkStatic.sh`     

Step 2) and 3) must be performed every time application is updated. 
Recommended steps for update app:  
```shell script
cd /your/app/folder
# checkout a new package-lock.json
npm ci
npm ddp
ubcli linkStatic -u .. -p ... - cfg ...
chmod +x ./.linkStatic.sh
./.linkStatic.sh
``` 

Last command in script will set a modification time for all files downloaded from package registry (files with modify date === 1986-01-01)
to the current time. This allow nginx to generate a correct ETag for such files.
       
### How to prevent server-side logic to be exposed for client
Some of the modules placed into `node_modules` folder can contain a server-side logic what should be hidden from clients.
  
First let's explain what modules are exposed:
   - modules without `config.ubmodel` section and modules with `config.ubmodel.isPublic: true` inside package.json
     are exposed as is (sym-linked into ${httpServer.inetPub}/clientRequire)
   - for modules with `config.ubmodel && !config.ubmodel.isPublic` only `public` folder content and package.json itself
     is sym-linked into ${httpServer.inetPub}/clientRequire. All other model folders are hidden from client

So, **to hide all package files from client add a "config" : {"ubmodel": {} } section into package.json**
    
## Configuring nginx
`ubcli` tool have a command `generateNginxCfg` for creating include for nginx based on application configuration.

cd to your application folder and type:  
```shell script
ubcli generateNginxCfg
```  

This command generate file `ub-proxy.conf` ready to be included into main nginx configuration.

To see additional parameters what can be passed to `generateNginxCfg` type:  
```shell script
ubcli generateNginxCfg --help
```  

In case external url is use HTTPS protocol, you need to add `-sslkey path/to/key -sslcert path/to/cert`. 
Also, we recommend adding a switch `-r` to add a redirection from http to https:  
```shell script
ubcli generateNginxCfg -sslkey /usr/www/.ssh/web_key.key -sslcert /usr/www/.ssh/web_ker_cert.pem
```

If you expect user need to store a big documents add `-maxDocBody XXXm` where XXX ia a maximum document size (in Mb) for upload.      

The generated config is well documented - see comments inside for explanation of what we did there. 

`ub-proxy.conf` we generate should be included into `nginx.conf`:  

For Windows add this line to end of http section inside `nginx.conf`:  
```
include path/to/ub-proxy.conf;
```
and restart nginx.

For Unix symlink file into `/etc/nginx/sites-enabled`:  
```shell script
sudo ln -s path/to/ub-proxy.conf /etc/nginx/sites-available/default_server.conf 
sudo ln -s /etc/nginx/sites-available/default_server.conf /etc/nginx/sites-enabled 
sudo nginx -s reload 
```

## Extending autogenerated config
Each execution of `ubclu generateNginxCfg` command overrides existed config.
Since it called by `ub-app-upgrade` lifecycle hook, modifying a generated `conf` file directly is a _bad idea_.

For extending purpose generated config contains three [include](https://nginx.org/en/docs/ngx_core_module.html#include) directives:
 - `include {{{sharedUbAppsFolder}}}/{{{sendFileLocationRoot}}}/http*.conf;` on the upper level to add a http level directives
 - `include {{{sharedUbAppsFolder}}}/{{{sendFileLocationRoot}}}/upstream*.conf;` inside upstream section to extend an upstreams list
 - `include {{{sharedUbAppsFolder}}}/{{{sendFileLocationRoot}}}/server*.conf;` inside a `server{}` block to add rules into server config section

where:
 - `{{{sendFileLocationRoot}}}` is a value from `http.reverseProxy.sendFileLocationRoot` ubConfig key (default is externalURL hostname with '.' replaced by '-' (http://test.com -> test-con)
 - `{{{sharedUbAppsFolder}}}` = `/var/opt/unitybase/shared` for Unix and `C:/ProgramData/unitybase/shared` for Windows

Ensure nginx main process have access to these files (use `nginx -T` to verify all configs)

Examples (consider externalURL=https://my.server.com in ubConfig) :

### Pass a real client IP in case of several reverse proxies  
Get a client real IP in case some Load balancer is running on b.b.b.b IP address behind us, so HTTP request is transferred as
   `Client(a.a.a.a) -> LB (b.b.b.b) -> Nginx (c.c.c.c) -> UB (d.d.d.d)`:
```shell
mkdir -p /var/opt/unitybase/shared/my-server-com
cat <<<EOF
  # use client real IP as reported by proxy
  real_ip_header    X-Forwarded-For;
  # A proxy we trust (address, hostname or mask)
  set_real_ip_from  b.b.b.b;
EOF > /var/opt/unitybase/shared/my-server-com/server-getRealIpFromUpfront.conf
```
Load balancer on b.b.b.b should correctly set an `X-Forwarded-For` header. In case LB is nginx - `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`  

> for more details see [ngx_http_realip_module](http://nginx.org/en/docs/http/ngx_http_realip_module.html)

### Override a proxy read timeout
By default, nginx waits for reading a response from the UB server for 60 second - this value is equal to the default XMLHTTPRequest timeout
for UBConnection. 

Some apps increase UBConnection level timeout (for example using `http.setGlobalConnectionDefaults({receiveTimeout: 120000})` ).
In such cases nginx `proxy_read_timeout` should also be set to 120000. Example:

```shell
mkdir -p /var/opt/unitybase/shared/my-server-com
cat <<<EOF
  # increase  proxy_read_timeout from default 60s to 120s for long running queries
  proxy_read_timeout 120s;
EOF > /var/opt/unitybase/shared/my-server-com/server-Proxy_timeout120.conf
```
 
### Add additional upstreams to the load balancing group
Add additional upstreams (:8883 and :8884) to the load balancing group:
```shell
mkdir -p /var/opt/unitybase/shared/my-server-com
cat <<<EOF
  server http://127.0.0.1:8883 max_fails=2 fail_timeout=30;
  server http://127.0.0.1:8884 max_fails=2 fail_timeout=30;
EOF > /var/opt/unitybase/shared/my-server-com/upstream-allservers.conf
```

### Generate a thumbnails for getDocument
Thumbnails can be generated with help of [ngx_http_image_filter_module](http://nginx.org/ru/docs/http/ngx_http_image_filter_module.html).

On client side - add a `size=small` parameter to the getDocument URL

Consider auto-generated internal location name for store is `/localhost/simple` and store folder is
`/var/opt/unitybase/my-server/stores`

Config below should be placed to
`/var/opt/unitybase/shared/my-server-com/server-thumbnails-for-document-store.conf`

```
location ~* /localhost/simple/(.*) {
    internal;
    set $filename $1;
    if ($upstream_http_x_query_params ~* "size=small") {
        set $fullname "/var/opt/unitybase/my-server/stores/simple/$filename";
        rewrite ^ /xresize;
    }
    # force browser to ask what data is not modified on server on every request
    expires -1;
    add_header Cache-Control "must-revalidate, private";
    alias /var/opt/unitybase/my-server/stores/simple/$filename;
}
location /xresize {
    internal;
    image_filter crop 100 100;
    image_filter_jpeg_quality 75;
    image_filter_buffer 20M;
    image_filter_interlace on;
    alias $fullname;
}
```

Explanation:
 - all requests to /getDocument are redirected by UB to the internal location `/localhost/simple`
 - config above adds the same location, but with regexp, so it overrides a default `/localhost/simple` rules
 - UB server proxies a request parameters to the nginx using `x-query-params` header
 - in case `x-query-params` contains `size=small` part - config above redirect such requests to the `/xresize` internal location
 - in `/xresize` with help of `ngx_http_image_filter_module` module images cropped to size `100x100px` cached into memory and returned to client

### Override a max body size
Override a max body size to 100Mb for /hugeFileUpload location
```shell
mkdir -p /var/opt/unitybase/shared/my-server-com
cat <<<EOF
  location /hugeFileUpload {
    proxy_pass          http://my-server-com;
    client_max_body_size    100m;
  }
EOF > /var/opt/unitybase/shared/my-server-com/server-hugeFileUpload.conf
```

## Load balancing

The generated config is ready to be extended for load balancing.

Pass `-lb` option for adding load balancer specific settings to nginx config:  
```shell script
ubcli generateNginxCfg -lb
```

Additional upstream servers are included from `/var/opt/unitybase/shared/NORMALIZED_EXTERNAL_URL/upstream*.conf`.
See `Extending config` above.

## Security zones
UnityBase Enterprise and Defence Editions (starting from version 5.17.10) supports a security zones conception.
Current implementation depends on [nginx geo module](http://nginx.org/ru/docs/http/ngx_http_geo_module.html)

Setup:

 - insure your nginx compiled with ngx_http_geo_module (`nginx -V`). If not either re-compile nginx or install a
 full nginx version: `sudo apt install nginx-full`
 - configure a `zonesAuthenticationMethods` and `securityZoneHeader` in ubConfig. Example:  
```json
"httpServer": {
    "reverseProxy": {
        "kind": "nginx",
        "securityZoneHeader": "X-Sec-Zone"
    },
    ....
},
...
"security": {
    "authenticationMethods": ["UB", "Negotiate", "OpenIDConnect"],
    "zonesAuthenticationMethods": [
        {
            "name": "intr",
            "authenticationMethods": ["UB", "Negotiate"]
        },
        {
            "name": "extr",
            "authenticationMethods": ["UB", "OpenIDConnect"]
        }
    ],
    ...
}
```  
 - add security zones mapping into nginx application config (usually `ub-proxy.conf`) on the http level (just before `server` directive).

Instead of modifying config directly - create two file

Zones config `/var/opt/unitybase/shared/NORMALIZED_EXTERNAL_URL/http_zones.conf` and put there:  
```
# Security zones
geo $YOUR_EXTERNAL_URL_security_zone {
  default        extr;
  # proxy          10.0.0.1 # requests from this address will use client IP from X-Forwarded-For header
  10.8.0.0/16    intr;
}
```
Proxy header directive `/var/opt/unitybase/shared/NORMALIZED_EXTERNAL_URL/server_zones_header.conf` and put there:
```
   proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header    X-Sec-Zone $YOUR_EXTERNAL_URL_security_zone;
```

YOUR_EXTERNAL_URL should be replaced by server external url. 

# Tuning OS for high Load
## Linux

- TCP kernel parameters

Under sudo:
```shell script
touch /usr/lib/sysctl.d/40-ub-tcp-hiload.conf

echo "
# increase the ephemeral port range
net.ipv4.ip_local_port_range = 15000 65535
# decrease fin timeout 
net.ipv4.tcp_fin_timeout = 30
# increase a number of socket waiting for accept
net.core.somaxconn=1024
# raise the nofile/max open files/file descriptors/file handles limit
fs.file-max=262144
" > /usr/lib/sysctl.d/40-ub-tcp-hiload.conf

touch /etc/security/limits.d/40-ub-tcp-hiload.conf

echo "
# increase file limits
* hard nofile 1048576
* soft nofile 102400
" > /etc/security/limits.d/40-ub-tcp-hiload.conf
```

- Mitigations

  In case server is not a "public cloud VM" it is safe to disable all hardware vulnerability mitigations by adding
`mitigations=off` into GRUB_CMDLINE_LINUX_DEFAULT parameter of `/etc/default/grub`. This give +10-30% performance boots.
Example: `GRUB_CMDLINE_LINUX_DEFAULT="quiet splash mitigations=off"`

- Nginx main config
For instances with more than 1200 concurrent users file limits and per-worker connection limits should be increased.
On the root of the `/etc/nginx/nginx.conf` config:
```shell
worker_processes auto; # one worker per CPU core
worker_rlimit_nofile 98304;
events {
    worker_connections 4096;
}
```

To apply settings without a reboot:  
```shell script
sysctl -p /usr/lib/sysctl.d/40-ub-tcp-hiload.conf
ulimit -n 102400
update-grub # if mitigations changed
systemctl restart nginx
```

This allows to create ~1500 connections per second instead of default 470 and total
concurrent browser sessions up to 10000.
 
Explanation:
 
 Each HTTP connection require a TCP session, each TCP session is a pair IP+port,
 where port is dynamically taken from a range defined in `sysctl net.ipv4.ip_local_port_range`.
 After client disconnection port is busy for `sysctl net.ipv4.tcp_fin_timeout`
 
 Default port range values for Linux is 32768-60999 (28231 TCP connections).
 Since a modern browser can create 6 or even more TCP session for one page this is
 ~ 4700 concurrent users.
 
 