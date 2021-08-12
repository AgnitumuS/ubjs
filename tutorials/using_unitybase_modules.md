[[toc]]
# Applications pool management using `pm2`

For a production environment all operations below must be performed under user who execute a applications in pool. 
Consider this is a `ub-service` user:   
```shell script
runas /user:ub-service "C:\Far\Far.exe"
```

 - install a pm2
    ```shell script
    npm install -g pm2
    ```
        
 - set a PM2_HOME to a folder, accessible to all users
    ```shell script
    SETX PM2_HOME c:\node_pm2
    ```

    restart a cmd to apply a _setx_ command results
            
 - Check `pm2` is accessible
    ```shell script 
    pm2 ls
    ```
    if not - add a `%APPDATA%\npm` to the `ub-service` user PATH variable (restart a cmd):         
    ```shell script
    setx PATH %APPDATA%\npm
    ```
       
 - Add a application(s) to pool. 
 
    For `sinopia`:  
    ```shell script
    create folder c:\ub-npm
    run from folder c:\ub-npm
    npm install --save sinopia
    run from folder c:\Users\ub-service\AppData\Roaming\npm
    pm2 start --name sinopia C:\ub-npm\node_modules\sinopia\lib\cli.js -- -c C:\ub-npm\config.yaml 
    ```

    For CMS:  
    ```shell script
    pm2 start --name ub-cms C:\mmcms-server\server.js
    ```

    For a UnityBase application:  
    ```shell script
    SET UB_HOME=<PathToYourUB>
    pm2 start --name ub-app %UB_HOME%\ub -- -cfg C:\<pathToApplication>\ubConfig.json
    ```
         
 - Save pm2 tasks
    ```shell script
    pm2 dump
    ````

 - [create a scheduled task](https://technet.microsoft.com/en-us/library/cc748993(v=ws.11).aspx) for run a pm2 on system startup
    ```shell script
    schtasks /Create /RU ub-service /RP adminub /SC ONSTART /TN PM2 /TR "C:\Users\ub-service\AppData\Roaming\npm\pm2.cmd resurrect" /V1 /F
    ```
        
    admin rights is required. /V1 switch is **IMPORTANT** - it set a valid working folder for the command (pm2.cmd inside use a %~dp0 - a cwd() analog in cmd)

# UnityBase modules repository

<http://registry.unitybase.info>

# Develop a modules for UnityBase

## package.json

Modify your `package.json` file by adding a `publishConfig` property. This prevents `npm` to publish a module to a public npm repository.
We strongly recommend [JavaScript Standard Style](http://standardjs.com/index.html) code style, so we add a "standard" to the package.json devDependency:  
```json
"publishConfig": {
 "registry": "http://registry.unitybase.info"
},
"devDependencies": {
   "standard": "*"
}
```

## Lerna 

Install `lerna` (> 2.0 required for scoped packages support):  
```shell script
npm install -g lerna@latest
```

Install all other required modules:  
```shell script
npm install
```

## Developer environment 

Set up your IDE to use a [JavaScript Standard Style](http://standardjs.com/index.html). 
For WebStorm users [see this link](http://standardjs.com/webstorm.html). 

For debugging your modules use a (https://docs.npmjs.com/cli/link)[npm link] command. 
This command will create a symlink from your module folder to your test application folder   

**WARNING** `npm link` command will install (hard copy) all dependencies to the `node_modules`. 
If your package depends on some module, link it BEFORE linking current module to the global NPM folder.

For example, if your module depends on `@unitybase/uba` run:  
```shell script
npm link @unitybase/uba
```

before commands below. All UnityBAse packages have a `npm run dev` script for this purpose.
   
Create a link from a development folder to a global npm storage:  
```shell script
cd X:\pathToSource\ub_model_ub
npm link 
```

Create a link from global npm storage to a application node_modules folder:
```shell script
cd pathToYourTestProject
npm link ub_model_ub
```

# Publishing module to UnityBase repository

Ensure you set a `publishConfig` parameter in `package.json`. 

Bump a module version using (file:///C:/nodejs/node_modules/npm/html/doc/cli/npm-version.html)[npm version] command.
For initial publication this step can be omitted. 
For example the command below will increase a patch version of module `ub_model_ub`:     
```shell script
cd X:\pathToSource\ub
npm version patch -m "Upgrade to %s - remove a `ub-ddl-generator` dependency"
```

Publish a module:  
```shell script
npm publish
```
      
To publish to a UnityBase repository you must authorize your requests:  
```shell script
npm adduser --registry http://registry.unitybase.info
```

# Installing packages
```shell script
npm set registry http://registry.unitybase.info
npm install @unitybase/ub --save
```
