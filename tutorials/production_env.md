[[toc]]

# Production deployment (recommendations)

##  Folder structure
```
/opt
  /unitybase
    /server                 # ub server (installed by rpm/deb. ub symlinked to `/usr/bin/ub`)
        ub                  # executable 
    /products               # products (should be installed by app developer)
        /docflow
            ubConfigDocflow-tpl.json
        /docflow@2.1.4
            ubConfigDocflow-tpl.json
        /scriptum
        /deals
        /docflow-bpm
        ...
    /apps                  # available applications (either products what configured for certain customer or stand-alone app)
        /crb.docflow        # product based application
            /localdb        # local database files (SQLite3, SQL Server localdb etc.)  
            /inetpub        # content of this folder available using `/statics` endpoint
            /stores         # application BLOB stores
            /logs           # local logs (for develepnemt purpose; production logs are written to journald)
            /models         # customer models  
                /vmodel     # vendor model (customer-specific addition for product developed by product owner) 
                    crb.js  
                /cmodel     # customer model (customer-specific addition for product developed by customer)
            ubConfig.json   # application config - for products - symlynk to a product config `../../prodicts/docflow@2.1.4/ubConfigDocflow-tpl.json`
            ubConfig.env    # Environment variables for application instance                   
       /docs-adminui        # stand-alone application (not based on any product)
            /localdb
            /inetpub
            /stores
            /models
                /req        # application specific model
            /node_modules   # application modules. For products this folder is placed in /products/productName
            ubConfig.json   # for stand-alone app not a symlynk but file
            ubConfig.env
        

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
 
Product owner should create an application config template `ubConfigProductName-tpl.json` what uses environment
variables for its variable parts. For a multi-database products we recommended wraping a database sectins to `#ifdef` as such:
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
| UB_APPDATA    | `/opt/unitybase/apps/$UB_APP/` Note a trailing '/' - this allows to use path relative to `cwd` for development (when UB_APPDATA is not defined) |

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

 
> Starting from UB@5.18.12 server sets a NODE_PATH variable to the real path of application config, so all modules in the
`product/node_modules` folder are available in the `vmodel` using `require('moduleName')`.
   
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
   ubConfigDocFlow-oracle-tpl.json
     (config contains `"vendorModels": "%UB_VMODELS%"`)         
```
To start an application in debug mode for a certain customer (crb) using product template
and Oracle as a database run ub as:
```shell script
UB_DB_DRIVER=Oracle UB_CFG='ubConfigDocFlow-tpl.json' UB_VMODELS='crb:crb_bpm' ub -cd -dev
```   

All variables can be exported from env file using
```shell script
set -o allexport; . ubConfig-dev.env; set +o allexport
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
   

#### Application folder structure
Each application folder should contain the follow:
```
/opt/unitybase/apps
  /appName
    /localdb        # local database files (SQLite3, SQL Server localdb etc.)
      appnameFTS.sqlite3
      ..    
    /inetpub        # content of this folder available using `/statics` endpoint
      favicon.ico
      robots.txt
      ...    
    /stores         # application BLOB stores
    /models         # customer models  
      /crb          # vendor model (customer-specific addition for product developed by product owner) 
        package.json  
      /crbc         # customer model (customer-specific addition for product developed by customer)
    ubConfig.json   # application config - symlynk to a product config `../../products/docflow@2.1.4/ubConfigDocflow-tpl.json`
    ubConfig.env    # Environment variables for application instance  
```
Product template uses this directory structure in the product template ubConfig. 

Product template can use additional environment variables. These variables should be defined in `appfolder/ubConfig.env`.  

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
systemctl reset-failed
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

For a systemd < 254 setup `/etc/systemd/journal.conf` as in `/etc/systemd/journald@unitybase.conf`
For a systemd `/etc/systemd/journald@unitybase.conf` preset is used automatically.

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
 Changes to /etc/sysctl.conf do not take effect until reboot. To update the values immediately, type the following commands as root:
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

## Overriding a default application startup rules 

### All services
```shell script
systemctl edit unitybase@.sevrice
systemctl revert unitybase@.sevrice
sudo systemctl daemon-reload
```

### Certain my-app instance
```shell script
systemctl edit unitybase@my-app.sevrice
```