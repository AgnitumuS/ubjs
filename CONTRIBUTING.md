# Setup

Follow [UnityBase setup instruction](https://git-pub.intecracy.com/unitybase/ubjs#install-windows)

```
mkdir dev && cd dev
git clone https://git-pub.intecracy.com/unitybase/ubjs.git
rem In case you have access to UB Enterprise - clone it
git clone https://gitlab.intecracy.com/unitybase/ub-e.git
rem In case you have access to UB Defense - clone it
git clone https://gitlab.intecracy.com/unitybase/ub-d.git
cd ubjs
npm i
lerna bootstrap
```

Starting from 2019-03-01 all subpackages use `webpack@4` for build.

To prevent installing webpack and all other needed stuffs in every `packages/*` folder and to avoid
installing it globally we set all build-related tools into the `devDependency` section of `ubjs/package.json`.

Before execution of any build commands like `npm run build` or `lerna bootstrap` first install ubjs
project dependencies

```bash
cd ubjs
npm i
```
and when add a ubjs/node_modules/.bin to PATH (locally)

On Linux
```bash
cd ubjs
PATH=`pwd`/node_modules/.bin:$PATH
```

On Windows:
```
cd ubjs
SET PATH=%CD%\node_modules\.bin;%PATH%
```

Verify webpack is accessible
```
webpack --version
```
should output version >= 2.29.6


To execute a autotest
```
cd apps\autotest
tsql3.cmd
// should output N of N passed success

// run ub in dev move with console debug logs
ub -cd -dev
```
Point your browser (Chrome or FireFox) to http://localhost:8881/ubadminui-dev to access AdminUI (admin/admin)


To run a [TechEmpower Web Framework Benchmarks](https://www.techempower.com/benchmarks/)

```
cd apps\benchmarks
prepare.cmd
ub
```

See benchmarking instruction in [benchmarks/README.md](https://git-pub.intecracy.com/unitybase/ubjs/blob/master/apps/benchmarks/README.md)

# Adding new packages to UnityBase package repository

## package.json

Modify your `package.json` file by adding a `publishConfig` property. This prevents `npm` from publishing the module
  to a public npm repository.
We strongly recommend using (http://standardjs.com/index.html)[JavaScript Standard Style] code style,
so we add a "standard" to the package.json devDependency
 
       "publishConfig": {
         "registry": "http://packages.unitybase.info"
       },
       "devDependencies": {
           "standard": "*"
       }

## Build UnityBase packages with Lerna

  Compiling native modules. Current implementation fpc3.1.1 to be installed.
  Path to FPC should be added to PATh environment variable:
  
  ```bash
  export PATH=~/fpcupdeluxe/fpc/bin/x86_64-linux:$PATH
  ```
  
  Build modules
  
  ```bash
  npm run build
  ```


## Developer environment 

See [WebStorm configuration instruction](https://git-pub.intecracy.com/unitybase/ubjs/wikis/configuring-webstorm)

# Publishing module to UnityBase repository

Ensure you set a `publishConfig` parameter in `package.json`. 

## Manual publishing

Bump a module version using (file:///C:/nodejs/node_modules/npm/html/doc/cli/npm-version.html)[npm version] command.
For initial publication this step can be omitted. For example the command below will increase a patch version of module `ub_model_ub`:   

      cd X:\pathToSource\ub_model_ub
      npm version patch -m "Upgrade to %s - remove a `ub-ddl-generator` dependency"

Publish a module

      npm publish
      
To publish to a UnityBase repository you must authorize your requests
      
      npm adduser --registry https://registry.unitybase.info

## Publishing using Lerna

For a monorepo controlled by Lerna 

	lerna updated

 will list modules updated after the last execution of `lerna publish` run - see [lerna update](https://github.com/staltz/lerna/blob/master/README.md#updated) for details

 	lerna publish 

 will publish all updated modules and create a new git commit/tag

 In case monorepo contains many modules (as ubjs) with cross-dependencies and you _SURE_ you 
make a minor update to one of them then recommended way is to use `--only-explicit-updates` option during publishing.
This option allows only the packages that have been explicitly updated to make a new version.

	lerna updated --only-explicit-updates
	lerna publish --only-explicit-updates

 See [only-explicit-updates options explanation](https://github.com/staltz/lerna/blob/master/README.md#--only-explicit-updates)

# Installing packages
Create the `.npmrc` file with the following content:

    @unitybase:registry=https://registry.unitybase.info/
    @ub-e:registry=https://registry.unitybase.info/
    @ub-d:registry=https://registry.unitybase.info/

This set a registry for a UnityBase scope.
Now install packages:

    npm install @unitybase/ub --save


# Manage a remote server using console
Usually we manage a windows-based environment using Remote Desktop Connection (log in to the GUI mode and use a mouse to do something). 
This is a slow and a non-scalable way. Below we describe a "unix way" of remote server management.

## Console - a right way
  We strongly recommend using a Far Manager + ConEmu instead of Explorer + cmd:

  - install a [Far Manager](https://www.farmanager.com/download.php?l=en)
  - install a [ConEmu](https://conemu.github.io/) to the same folder where Far is installed
  - Enjoy!
  
## Enable WinRM on the remote server

###  Verify WinRM is enabled

	$ winrm quickconfig
  
  Starting from windows Server 2012 PowerShell remoting is enable dy default. If disabled - run (as admin)

  	$ Enable-PSRemoting -Force

  _ConEmu {cmd:Admin} console indicate a `admin` session as a **$** sign in the left of command line_

###  Enable WinRM remote access

#### Both server and client are in the same domain

  In case both your computer and remote server are in the same domain, no additional steps required. 

#### Server and client are in re different domain (or no domain at all)

  - set up a valid HTTPS certificate (with a common name your host <fdqn hostname> either using IIS of from command line using `makecert` & `httpcfg` as 
    described [in UnityBase HTTP server tutorial](http://unitybase.info/api/serverNew/tutorial-http_server.html).
    In case you use a self-signed certificate add your CA certificate to the Local Computer Trusted root certification list

  - configure a winrm to accept connections using https protocol

	$ winrm create winrm/config/Listener?Address=*+Transport=HTTPS @{Hostname="<fdqn hostname>";CertificateThumbprint="<tumbprint without space your ssl cert>"}

	##### delete listener https (if need)
	$ winrm set winrm/config/Listener?Address=*+Transport=HTTPS @{Enabled="false"}
	##### disable listener https (if need)
	$ winrm delete winrm/config/Listener?Address=*+Transport=HTTPS
  
  - check current permisions

	$ winrm g winrm/config/client 

  - add your host to trusted

	$ winrm set winrm/config/client @{TrustedHosts="*"}
    
## Add ub-service (local users perm) to "Allow logon locally" and "Logon as batch job" to local security policy

  	
## Connect ot Remote Server using PowerShell
  In ConEmu Select New->Shell->PowerShell

	> Enter-PSSession -EnableNetworkAccess -ConnectionUri https://<fdqn hostname>:5986/wsman/ -Credential ub-service
  

# Applications pool management using `pm2`

For a production environment all operations below must be performed under user who execute applications in pool. Consider this is a `ub-service` user 


        runas /user:ub-service "C:\Far\Far.exe"

 - install a pm2
        
        npm install -g pm2
        
 - set a PM2_HOME to a folder, accessible to all users
        
        SETX PM2_HOME c:\node_pm2
         
    restart a cmd to apply a _setx_ command results
            
 - Check `pm2` is accessible
 
        pm2 ls
        
   if not - add a `%APPDATA%\npm` to the `ub-service` user PATH variable (restart a cmd)       

        setx PATH %APPDATA%\npm
        
 - Add a application(s) to pool. 
 
 For `sinopia`
 
        create folder c:\ub-npm
		run from folder c:\ub-npm
		npm install --save sinopia
		run from folder c:\Users\ub-service\AppData\Roaming\npm
		pm2 start --name sinopia C:\ub-npm\node_modules\sinopia\lib\cli.js -- -c C:\ub-npm\config.yaml 
 
 For CMS
 
        pm2 start --name ub-cms --max-restarts 5 C:\mmcms-server\server.js
        
 For a UnityBase application
         
         SET UB_HOME=<PathToYourUB>
         pm2 start --name ub-app --max-restarts 5 %UB_HOME%\ub -- -cfg C:\<pathToApplication>\ubConfig.json 
        
 - Save pm2 tasks
      
        pm2 dump
      

 - [create a scheduled task](https://technet.microsoft.com/en-us/library/cc748993(v=ws.11).aspx) for run a pm2 on system startup
    
**Under admin command prompt** run

```    
schtasks /Create /RU ub-service /RP adminub /SC ONSTART /TN PM2 /TR "C:\Users\ub-service\AppData\Roaming\npm\pm2.cmd resurrect" /V1 /F
```
where ub-service is a service account name, and adminub is a password for a service account
        
   **TIP** /V1 switch is **IMPORTANT** - it set a valid working folder for the command (pm2.cmd inside use a %~dp0 - a cwd() analog in cmd)
 

