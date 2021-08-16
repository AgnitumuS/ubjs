[[toc]]

# Production deployment (recommendations)

## Lifecycle

### Application lifecycle

For applications (consider application name is `autotest`) 

 - Pack app for deployment (in the application folder)
```shell script
cd autotest
ub-pack # this creates `/tmp/ubapp-autotest#x.y.z.tar.gz
```
 - Copy resulting tarball to the server and run deploy
```shell script
sudo -u unitybase ub-deploy ubapp-autotest#x.y.z.tar.gz
```

 - Edit (create) environment variables file in `/var/opt/unitybase/autotest/ubConfig.env`.
> cd `/opt/unitybase/apps/autotest` and run `ub -T` to see variables list  

 - If this is first time setup of application - run initialization 
```shell script
sudo -u unitybase ub-app-init autotest
sudo systemctl enable --now unitybase@autotest
```

 - If this is upgrade
```shell script
sudo systemctl stop unitybase@autotest
sudo -u unitybase ub-app-upgrade --app autotest 
sudo systemctl start unitybase@autotest
```

### Product lifecycle
For products (consider product name is `docflow`)

 - Pack product for deployment (in the application folder)
```shell script
cd docflow
ub-pack # this creates `/tmp/ubproduct-docflow#x.y.z.tar.gz
```

 - Copy resulting tarball to the server and run deploy
```shell script
sudo -u unitybase ub-deploy ubproduct-docflow#x.y.z.tar.gz
```

 - If this is a first time product setup (there is no application for this product on this server)
   - create new app
   ```shell script
   sudo -u unitybase ub-app-new -p docflow -a docflow-cust1
   ``` 
   - edit application environment variables file in `/var/opt/unitybase/docflow-cust1/ubConfig.env` and 
     run application initialization
   ```shell script
   sudo -u unitybase ub-app-init cust1 # will create app docflow-cust1  
   ```
   
 - if this is an upgrade - all affected applications should be upgraded
 ```shell script
 sudo systemctl stop unitybase@docflow*
 # for each app (docflow-cust1)
 sudo -u unitybase ub-app-upgrade --app docflow-cust1
  ...
 sudo -u unitybase ub-app-upgrade --app docflow-custN
 sudo systemctl start unitybase@docflow*  
 ```    
     

### Prepare application/product for deployment
In the application/product folder run a command
```shell script
ub-pack
``` 
This command installs all application dependencies and creates an archive for future deployment.

All files what must be excluded from archive should be noted in `.npmignore`. Also, ignored:
 - all files and folders starts with '.'
 - *.log
 - /logs, /stores, /localdb
 - ./inetpub/clientRequire folder 

In case this is a product, set a
```
"config": {
 "ubapptype": "product"
}  
```
in the package.json.

Application/product version is taken from "version" inside package.json and should be increased before packing to prevent
deployment conflict in the future.

For testing purpose `ub-pack` can be executed with `-m DEV` parameter. In this case instead of `npm i --production`
packing script uses `yarn`, so if `workspaces` is defined in the package.json then some dependencies are linked.
In any case all linked dependencies are included into resulting archive as files (not as symlinks). 

### Deploy app/product
Archive created by `ub-pack` can be deployed using command 
```shell script
sudo -u unitybase ub-deploy path/to/ubapp-appName#version.tar.gz
```
For applications (`ubapp-*.tar.gz`) deploy script archive previous app version, unpack a new app into `/opt/unitybase/apps/$UB_APP`
and creates folder structure for application data in the `/var/opt/unitybase/$UB_APP` (if missing).

For products (`ubproduct-*.tar.gz`) deploy script archive previous product version and unpack a new product
into `/opt/unitybase/products/$UB_APP`.
 
##  Folder structure
```
/var
  /opt
      /unitybase            # applications data (localdb, stores, temporary logs)
        /shared             # data shared between all applications
            osplm.ini       # UB EE+ DSTU library settings 
            /certificates   # UB EE+ DSTU certificates storage 
                 CACertificates.p7b # UB EE+ root CA's certificates bundle 
        /crb-docflow        # crb.docflow data
            /_temp          # temp folder for mdb BLOB store
            /cmodels        # customer model (customer-specific addition for product developed by customer)
            /localdb        # local database files (SQLite3, SQL Server localdb etc.)  
            /stores         # BLOB stores
            ubConfig.env    # Environment variables for application instance
        /docs-adminui       # docs-adminui application data
            /_temp
            /cmodels
            /localdb          
            /stores         
            ubConfig.env
  /log
     /unitybase             # local logs for develepnemt purpose; production logs are written to journald  
/opt
  /unitybase
    /server                 # ub server (installed by rpm/deb. ub symlinked to `/usr/bin/ub`)
        ub                  # executable 
    /products               # products (should be installed by app developer)
        /docflow
            ubConfig.json
        /docflow@2.1.4
            ubConfig.json
        /scriptum
        /deals
        /docflow-bpm
        ...
    /apps                   # available applications (either products what configured for certain customer or stand-alone app)
        /crb-docflow        # product based application (in form customer-product)
            /inetpub        # content of this folder available using `/statics` endpoint
            /models         # vendor model (customer-specific addition for product developed by product owner)
              /crb
                crb.js
                package.json  
            ubConfig.json   # application config - for products - symlynk to a product config `../../products/docflow/ubConfig.json`
       /docs-adminui        # stand-alone application (not based on any product)
            /inetpub
            /models
                /req        # application specific model
            /node_modules   # application modules. For products this folder is placed in /products/productName
            ubConfig.json   # for stand-alone app not a symlynk but a file                           

/usr/lib/systemd/system
  unitybase@.service        # UnityBase vendor unit. Do not edit it directly - see overriding topic below
/ubr/bin/ub                 # symbolic link to /opt/unitybase/server/ub   
```

## User and group
`ub-server` installation package creates user `unitybase` and group `unitybase`.
This user is used to starts a `unitybase@` services.

Also `/opt/unitybase/apps` is owned by `unitybase` user/group, so any member of `unitybase` group can create a new app.   

**Do not login using `unitybase` user!** -  instead create a user for each person who can manage UnityBase and add it into `unitybase` group:

```shell script
# add user to a unitybase group
sudo usermod -a -G unitybase your-user-name
# set unitybase as a primary group for user - files and folders the user creates will be assigned to the primary group
sudo usermod -g unitybase your-user-name
```


## Application as a service

### Product configuration
In terms of UnityBase `product` is a set of models and customizations what can be used by many customers.
The product examples is: `DocFlow`, `Scriptum`, `df-bpm` etc.

Products installed in the `/opt/unitybase/products/productname` folder as a superuser (root).
Product folder write permission allowed only for `root`, other user can read it content.
 
Product owner should create an application config template `ubConfig.json` what uses environment
variables for its variable parts. For a multi-database products we recommended wrapping a database section to `#ifdef` as such:
```
"connections": [
    //#ifdef(%UB_DB_DRIVER%=Oracle)
    { oracle config },
    //#endif
	//#ifdef(%UB_DB_DRIVER%=PostgreSQL)
    { Postgres config },
    //#endif
]
```
See `apps/autotest/ubConfig.json` in [ubjs project git repository](https://git-pub.intecracy.com/unitybase/ubjs).  

During startup service sets following variables:

| Variable name | Value and explanation                                                             |
|---------------|-----------------------------------------------------------------------------------|
| UB_APP        | Part after @ in the service name (autotest for `systemctl start unitybase@autotest`)  |
| UB_APPDATA    | `/var/opt/unitybase/$UB_APP/` Note a trailing '/' - this allows to use path relative to `cwd` for development (when UB_APPDATA is not defined) |
| UB_APPHOME    | `/opt/unitybase/apps/$UB_APP/` |

Additional variables can be added for application by placing it in the `%UB_APPDATA%ubConfig.env`.
This file used as `env` file for service.
    
Product template should contain placeholders for `application.domain.vendorModels` and `application.domain.customerModels`:
```
"application": {
  "domain": {
    "models": [....],
    "vendorModels": "%UB_VMODELS%",
    "customerModels": "%UB_CMODELS%"     
  }
}  
```
This allows application to add a customer-specific behaviors to a product.

`up-app-pack` lifecycle script detect product by check `config.ubapptype` in package.json === 'product'. 
 
> Starting from UB@5.18.12 server sets a NODE_PATH variable to the real path of application config, so all modules in the
> `product/node_modules` folder are accessible for `vendorModel` using `require('moduleName')`.
   
See application structure below for a list of folders for application data.

#### Tip for products developers
During development customers specific models and test data usually placed in the same git repository as a product files:
```
 \docflow
   \models
     \customer1
     \crb
     \crb_bpm
   \stores
   ubConfig.json
     (config contains `"vendorModels": "%UB_VMODELS%"`)         
```
To start an application in debug mode for a certain customer (crb) using product template
and Oracle as a database run ub as:
```shell script
UB_DB_DRIVER=Oracle UB_VMODELS='crb:crb_bpm' ub -cd -dev
```   

All variables can be exported from env file using
```shell script
set -o allexport; . ubConfig-dev.env; set +o allexport
# set -o allexport; source ubConfig-dev.env; set +o allexport
```

Or via command line using `-env`
```
ub -env ./ubConfig-dev.env
```  

We also recommend exporting an `UB_ENV` variable and put it to the `PROMPT_COMMAND` inside `.bashrc` to
see a current environment (put a `\e[0;35m\$UB_ENV\e[m` in your .bashrc PROMPT_COMMAND=). For example:
```shell script
PROMPT_COMMAND="__git_ps1 '\e[0;34m\$UB_ENV\e[m \w' '\\$ '"
```  
 
### Application

In terms of UnityBase application is either a product what configured for a certain customer, or a
"stand-alone" app - an application what not based on any product and used in single environment only.

Product based application examples are:
 - DocFlow for Customer#1: application based on DocFlow product with customizations for Customer#1
 - Scriptum for Customer#2: application based on `Scriptum` product with customizations for Customer#2

Stand-alone application examples are:
 - docs-adminui: AdminUI documentation project. Not based on a product since used on the unitybase.info website only 
 - autotest: an autotest application for UnityBase
    
Both type of applications are placed in the sub-folders of `/opt/unitybase/apps` folder. Name of the sub-folder is a $UB_APP.

Main part of product-based applications (including `node_modules` and config template) are placed in the /products sub-folder
and application data (vendorModels, customerModel, localdb, stores and .env file) - in the /apps sub-folder.
Config is symlinked from products into apps.

Stand-alone application can place all its part into /apps.
   

#### Application folders structure
Application with name `appName` place its code in `/opt/unitybase/apps/appName` (UB_APPHOME environment variable) and
its data in `/var/opt/unitybase/appName` (UB_APPDATA environment variable):

```
/opt/unitybase/apps
  /appName
    /inetpub        # content of this folder available using `/statics` endpoint
      favicon.ico
      robots.txt
      ...    
    /models         # customer models  
      /crb          # vendor model (customer-specific addition for product developed by product owner) 
        package.json
    ubConfig.json   # application config - symlynk to a product config `../../products/docflow@2.1.4/ubConfigDocflow-tpl.json`
/var/opt/unitybase/
  /appName
      /localdb        # local database files (SQLite3, SQL Server localdb etc.)
        appnameFTS.sqlite3
        ..    
      /stores         # application BLOB stores
      /cmodels  
        /crbc         # customer model (customer-specific addition for product developed by customer)
      ubConfig.env    # Environment variables for application instance  
```

Product template can use additional environment variables. These variables should be defined in `$UB_APPDATA/ubConfig.env`.  

### Start application 
A command below starts `autotest` application and schedule it to start after OS reboot:
```
sudo systemctl enable --now unitybase@autotest
```
In fact this is combination of two command: 
```
sudo systemctl enable unitybase@autotest # schedule application to start after boot
sudo systemctl start unitybase@autotest  # start application now
```

Vendor preset for `unitybase@` service is configured to restart service on failure with 1 second delay between restarts. 
In case service restarts more when 5 times during 30 second it marked as "failed" and should be started
manually (using `systemstl start`).   

To force systemd to reset service startup failure counters use a command:
```shell script
sudo systemctl reset-failed
```
 
Typical operations are:
 - start application
 ```shell script
 sudo systemctl start unitybase@YourAppName.service
 ```

 - stop application
```shell script
sudo systemctl stop unitybase@YourAppName.service
```

## Logs
### Setup logging

```shell script
# Create a log directory to allow journals to be stored on disk
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
```

For a systemd < 254 setup `/etc/systemd/journald.conf` as in `/etc/systemd/journald@unitybase.conf`

For a systemd >= 254 `/etc/systemd/journald@unitybase.conf` preset is used automatically.

Restart journald to apply new changes
```shell script
systemctl force-reload systemd-journald
```

### Logging performance
 Logs are written using UDP sockets. UDP/IP receive buffer default should be increased for better performance.
 
 Check the current UDP/IP receive buffer default and limit by typing the following commands:
```shell script 
 sysctl net.core.rmem_max
 sysctl net.core.rmem_default
``` 
 If the values are less than 26214400 bytes (25MB), you should add the following lines to the /etc/sysctl.conf file:
```shell script 
 net.core.rmem_max=26214400
 net.core.rmem_default=26214400
``` 
 Changes to /etc/sysctl.conf do not take effect until a reboot. To update the values immediately, type the following commands as root:
```shell script 
 sysctl -w net.core.rmem_max=26214400
 sysctl -w net.core.rmem_default=26214400
```

### Use logs

```shell script
# all logs for all UnityBase services since last boot
journalctl --boot -u unitybase*
# errors, warnings and notices starting from 9:00 for autotest app
journalctl --since 09:00 --until now -u unitybase@autotest -p notice
# export logs to LogView format
journalctl -u unitybase@autotest --no-hostname -o short-iso-precise --since today _COMM=ub > todaysLog.log
# follow logs 
journalctl -u unitybase* -f
```

File, exported to LogView'er format may contains a several start/stop parts.
To split a file `todaysLog.log` into sessions use a command:

```shell
csplit todaysLog.log --prefix='todaysLog' --suffix-format='%02d.log' '/srvr  StartupPath/' '{*}'
```

## Overriding a default application startup rules 

### All services
```shell script
systemctl edit unitybase@.sevrice
systemctl revert unitybase@.sevrice
sudo systemctl daemon-reload
```

Or create a drop-in manually 
```
mkdir /etc/systemd/system/unitybase@.service.d
```
and place there `*.conf` file with parameters what needs to be added / override. 
See [systemd.unit](https://www.freedesktop.org/software/systemd/man/systemd.unit.htm) for more information.

### Certain my-app instance
```shell script
systemctl edit unitybase@my-app.sevrice
```

## Metrics
There is two metrics sources

### /stat endpoint
- authorised user can send a GET request to `/stat` endpoint to obtain a metrics.
```javascript
UB.connection.get('stat').then(v => console.debug(v.data))
```
The response example:
```json
{
 "sessions_total": 1,
 "threads_total": 4,
 "incoming_bytes": 32873,
 "outcoming_bytes": 416432,
 "responses_total": [0, 0, 59, 2, 1, 0],
 "security_exception_count": 0,
 "js_gc_count": 92,
 "js_memory_bytes": 30593024,
 "http_perning_request_count": 0
}
```
Here:

| Stat metric     | Value and explanation                                                             |
|-----------------|-----------------------------------------------------------------------------------|
| sessions_total  | Total count of active user session                                                |
| threads_total   | Worker thread count (threadPoolSize parameter in ubConfig)                        |
| incoming_bytes  | Bytes receive over HTTP                                               |
| outcoming_bytes | Bytes send over HTTP                                                |
| responses_total | Responses count for status codes 0XX(should be 0), 1XX, 2XX, 3XX, 4XX, 5XX. In example above there is 59 2XX responses |
| security_exception_count | All security related exceptions count (including session expire errors) |
| js_gc_count | Number of times (for all threads) GC has been invoked. Includes both major and minor GC |
| js_memory_bytes | Amount of bytes allocated by the JS engines (all threads) |
| http_perning_request_count | How many input tasks are currently waiting to be affected by thread pool (for server on Linux. For Windows always 0 - see below about HTTP service request queue |

### /metrics endpoint for Prometheus
Starting from 5.18.21 UnityBase EE expose a various application metrics in [Prometheus](https://prometheus.io/) format.
Feature is configured using `metrics` section of ubConfig.

`/metrics` endpoint is available without authorization. Access to endpoint is limited on the reverse proxy level using
`metrics.allowedFrom` parameter in ubConfig. Default is `deny` for all subnet masks.

For Linux server Prometheus metrics uses histograms whenever it makes sense, so per-endpoint (for HTTP), per-thread (for JS GC)
and per-entity statistics are available.

> **IMPORTANT** For Linux with non-english locale (not recommended) LC_NUMERIC=C environment variable should be sets for UnityBase server

```shell
curl http://localhost:8881/metrics
```
A truncated output example (with method profile enabled):
```text
# HELP http_request_duration_seconds HTTP request duration histogram
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="0,010000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="0,050000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="0,200000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="0,500000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="1,000000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="3,000000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="10,000000"} 2,000000
http_request_duration_seconds{endpoint="getAppInfo",status="3XX",le="+Inf"} 2,000000
http_request_duration_seconds_count{endpoint="getAppInfo",status="3XX"} 2,000000
http_request_duration_seconds_sum{endpoint="getAppInfo",status="3XX"} 0,000653
http_request_duration_seconds{endpoint="ubql",status="2XX",le="0,010000"} 6,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="0,050000"} 7,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="0,200000"} 7,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="0,500000"} 7,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="1,000000"} 7,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="3,000000"} 7,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="10,000000"} 7,000000
http_request_duration_seconds{endpoint="ubql",status="2XX",le="+Inf"} 7,000000
http_request_duration_seconds_count{endpoint="ubql",status="2XX"} 7,000000
http_request_duration_seconds_sum{endpoint="ubql",status="2XX"} 0,039072

# HELP unitybase_method_duration_seconds UnityBase entity method duration histogram
# TYPE unitybase_method_duration_seconds histogram
unitybase_method_duration_seconds{entity="uba_user",method="select",le="0,010000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="0,050000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="0,200000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="0,500000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="1,000000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="3,000000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="10,000000"} 5,000000
unitybase_method_duration_seconds{entity="uba_user",method="select",le="+Inf"} 5,000000
unitybase_method_duration_seconds_count{entity="uba_user",method="select"} 5,000000
unitybase_method_duration_seconds_sum{entity="uba_user",method="select"} 0,015004
unitybase_method_duration_seconds{entity="uba_role",method="select",le="0,010000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="0,050000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="0,200000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="0,500000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="1,000000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="3,000000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="10,000000"} 1,000000
unitybase_method_duration_seconds{entity="uba_role",method="select",le="+Inf"} 1,000000
unitybase_method_duration_seconds_count{entity="uba_role",method="select"} 1,000000
unitybase_method_duration_seconds_sum{entity="uba_role",method="select"} 0,000396

# HELP unitybase_httpext_duration_seconds External HTTP service request duration histogram
# TYPE unitybase_httpext_duration_seconds histogram
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="0.01"} 0
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="0.05"} 0
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="0.2"} 0
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="0.5"} 7
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="1.0"} 14
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="3.0"} 14
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="10.0"} 14
unitybase_httpext_duration_seconds{uri="www.google.com",status="2XX",le="+Inf"} 14
unitybase_httpext_duration_seconds_count{uri="www.google.com",status="2XX"} 14
unitybase_httpext_duration_seconds_sum{uri="www.google.com",status="2XX"} 6.854476

# HELP unitybase_fs_operation_duration_seconds File system operation duration histogram
# TYPE unitybase_fs_operation_duration_seconds histogram
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="0.01"} 4
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="0.05"} 5
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="0.2"} 5
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="0.5"} 5
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="1.0"} 5
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="3.0"} 5
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="10.0"} 5
unitybase_fs_operation_duration_seconds{path="simple",operation="persist",le="+Inf"} 5
unitybase_fs_operation_duration_seconds_count{path="simple",operation="persist"} 5
unitybase_fs_operation_duration_seconds_sum{path="simple",operation="persist"} 0.037999999999999999


# HELP process_max_fds Maximum number of open file descriptors.
# TYPE process_max_fds gauge
process_max_fds 1024,000000

# HELP process_virtual_memory_max_bytes Maximum amount of virtual memory available in bytes.
# TYPE process_virtual_memory_max_bytes gauge
process_virtual_memory_max_bytes -1,000000

# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total gauge
process_cpu_seconds_total 0,000000

# HELP process_virtual_memory_bytes Virtual memory size in bytes.
# TYPE process_virtual_memory_bytes gauge
process_virtual_memory_bytes 1619578880,000000

# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 449016,000000

# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds 18,000000

# HELP unitybase_sessions_total Logged in user sessions count
# TYPE unitybase_sessions_total gauge
unitybase_sessions_total 1,000000

# HELP unitybase_threads_total Thread pool size
# TYPE unitybase_threads_total gauge
unitybase_threads_total 4,000000

# HELP unitybase_incoming_bytes_total Total bytes incoming
# TYPE unitybase_incoming_bytes_total gauge
unitybase_incoming_bytes_total 35086,000000

# HELP unitybase_outcoming_bytes_total Total bytes outcoming
# TYPE unitybase_outcoming_bytes_total gauge
unitybase_outcoming_bytes_total 134531,000000

# HELP unitybase_security_exception_total Total count of security violation (incliding timed out sessions)
# TYPE unitybase_security_exception_total gauge
unitybase_security_exception_total 0,000000

# HELP http_pendng_request_count How many input tasks are currently waiting to be affected by thread pool
# TYPE http_pendng_request_count gauge
http_pendng_request_count 0,000000

# HELP unitybase_js_gc_count Number of times GC has been invoked. Includes both major and minor GC
# TYPE unitybase_js_gc_count gauge
unitybase_js_gc_count{thread="th01"} 26,000000
unitybase_js_gc_count{thread="th02"} 22,000000
unitybase_js_gc_count{thread="th03"} 22,000000
unitybase_js_gc_count{thread="th04"} 22,000000

# HELP unitybase_js_bytes Amount of bytes allocated by the JS engine
# TYPE unitybase_js_bytes gauge
unitybase_js_bytes{thread="th01"} 9555968,000000
unitybase_js_bytes{thread="th02"} 7000064,000000
unitybase_js_bytes{thread="th03"} 7020544,000000
unitybase_js_bytes{thread="th04"} 6991872,000000
```

### Windows performance counter metrics
Under Windows HTTP level metrics are exposed as HTTP.sys specific performance counter

Most important is [HTTP Service Request Queues](https://docs.microsoft.com/en-us/windows/win32/http/scenario-3--performance-counters#performance-counters-for-httpsys)

If queue length is too long (200 and more) either a thread pool should be increased or profile and tune application logic.

