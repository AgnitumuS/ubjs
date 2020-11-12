[[toc]]

# Production deployment (recommendations)

## Lifecycle

### Application lifecycle

For applications (consider application name is `autotest`) 

 - Pack app for deployment (in the application folder)
```shell script
# 
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
# 
cd docflow
ub-pack # this creates `/tmp/ubproduct-docflow#x.y.z.tar.gz
```

 - Copy resulting tarball to the server and run deploy
```shell script
sudo -u unitybase ub-deploy ubproduct-docflow#x.y.z.tar.gz
```

 - If this is first time product setup (there is no application for this product on this server)
   - create new app
   ```shell script
   sudo -u unitybase ub-app-new -p docflow -a docflow-cust1
   ``` 
   - edit application environment variables file in `/var/opt/unitybase/docflow-cust1/ubConfig.env` and 
     run application initialization
   ```shell script
   sudo -u unitybase ub-app-init cust1 # will create app docflow-cust1  
   ```
   
 - if this is upgrade - all affected applications should be upgraded
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

If this is a product set a
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

Or create a drop-in 
```
mkdir /etc/systemd/system/unitybase@.sevrice.d
```
and place there `*.conf` file with parameters what needs to be added / override. 
See [systemd.unit](https://www.freedesktop.org/software/systemd/man/systemd.unit.htm) for more information.

### Certain my-app instance
```shell script
systemctl edit unitybase@my-app.sevrice
```