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
,
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
  - run a command `npx ubcli linkStatic`. This command creates a `.linkStatic.sh` script for sym-linking a static assets into `inetPub` folder
  - execute a `.linkStatic.sh`     

Step 2) and 3) must be performed every time application is updated. Recommended steps for update app

```bash
cd /your/app/folder
# checkout a new package-lock.json
npm ci
npm ddp
npx ubcli linkStatic -u .. -p ... - cfg ...
chmod +x ./.linkStatic.sh
./.linkStatic.sh
``` 

Last command in script will set a modification time for all files downloaded from package registry (files with modify date === 1986-01-01)
to the current time. This allow nginx to generate a correct ETag for such files.
       
### How to prevent server-side logic to be exposed for client
Some of modules placed into `node_modules` folder can contains a server-side logic what should be hidden from clients.
  
First let's explain what modules are exposed:
   - modules without `config.ubmodel` section and modules with `config.ubmodel.isPublic: true` inside package.json
     are exposed as is (sym-linked into ${httpServer.inetPub}/clientRequire)
   - for modules with `config.ubmodel && !config.ubmodel.isPublic` only `public` folder content and package.json itself
     is sym-linked into ${httpServer.inetPub}/clientRequire. All other model folders are hidden from client

So, **to hide all package files from client add a "config" : {"ubmodel": {} } section into package.json**
    
## Configuring nginx
`ubcli` tool have a command `generateNginxCfg` for creating a include for nginx based on application configuration.

cd to your application folder and type  

```bash
npx ubcli generateNginxCfg
```  

This command generate file `ub-proxy.conf` ready to be included into main nginx configuration.

To see additional parameters what can be passed to `generateNginxCfg` type
```bash
npx ubcli generateNginxCfg --help
```  

In case external url is use HTTPS protocol, you need to add `-sslkey path/to/key -sslcert path/to/cert`. 
Also we recommend to add `-r` for adding redirection from http to https:

```bash
npx ubcli -r generateNginxCfg -sslkey /usr/www/.ssh/web_key.key -sslcert /usr/www/.ssh/web_ker_cert.pem
```

If you expect user need to store a big documents add `-maxDocBody XXXm` where XXX ia a maximum document size (in Mb) for upload.      

Generated config is well documented - see comments inside for explanation of what we did there. 

`ub-proxy.conf` we generate should be included into `nginx.conf`:  

For Windows add this line to end of http section inside `nginx.conf`:
```
include path/to/ub-proxy.conf;
```
and restart nginx.

For unix symlink file into /etc/nginx/sites-enabled
```bash
sudo ln -s path/to/ub-proxy.conf /etc/nginx/sites-available/default_server.cfg 
sudo ln -s /etc/nginx/sites-available/default_server.cfg /etc/nginx/sites-enabled 
sudo nginx -s reload 
```

## Load balancing

Generated config is ready to be extended for load balancing.

Pass `-lb` option for adding load balancer specific settings to nginx config.
```bash
npx ubcli generateNginxCfg -lb
```

## Security zones
UnityBase Enterprise and Defence Editions (starting from version 5.17.10) supports a security zones conception.
Current implementation depends on [nginx geo module](http://nginx.org/ru/docs/http/ngx_http_geo_module.html)

Setup:

 - insure your nginx compiled with ngx_http_geo_module (`nginx -V`). If not either re-compile nginx or install a
 full nginx version `sudo apt install nginx-full`
 - configure a `zonesAuthenticationMethods` and `securityZoneHeader` in ubConfig. Example:
```
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
 - add security zones mapping into nginx application config (usually `ub-proxy.conf`) just before `server` directive.
 YOUR_EXTERNAL_URL should be replaced by server external url
 ```
# Security zones
geo $YOUR_EXTERNAL_URL_security_zone {
  default        extr;
  # proxy          10.0.0.1 # requests from this address will use client IP from X-Forwarded-For header
  10.8.0.0/16    intr;
}

server {
   ....
   proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header    X-Sec-Zone $YOUR_EXTERNAL_URL_security_zone;
   ... 
}
 ``` 
 
 
in the generated config adds additional servers inside `upstream` section 

# Tuning operation system for Hi Load HTTP(S)
## Linux
```
touch /etc/sysctl.d/60-tcp-hiload.conf
echo "
# increase the ephermal port range
net.ipv4.ip_local_port_range = 15000 65535
# decrease fin timeout 
net.ipv4.tcp_fin_timeout = 30
# increase a number of socket waiting for accept
net.core.somaxconn=1024
# raise the nofile/max open files/file descriptors/file handles limit
fs.file-max = 30000
" > /etc/sysctl.d/60-tcp-hiload.conf
```
to apply settings without reboot
```
sysctl -p /etc/sysctl.d/60-tcp-hiload.conf
``` 

This allow to create ~1500 connections per second instead of default 470 and total
concurrent browser sessions up to 10000.
 
Explanation:
 
 Each HTTP connection require a TCP session, each TCP session is a pair IP+port,
 where port is dynamically taken from a range defined in `sysctl net.ipv4.ip_local_port_range`.
 After client disconnection port is busy for `sysctl net.ipv4.tcp_fin_timeout`
 
 Default port range values for Linux is 32768-60999 (28231 TCP connections).
 Since modern browser can create 6 or even mode TCP session for one page this is
 ~ 4700 concurrent users.
 
 