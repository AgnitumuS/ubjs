[[toc]]

# Production deployment (recommendations)

For a production deployment we recommend using Linux. Current targets what tested by UnityBase team are CentOS8 and Ubuntu 20.04.

Recommended folder structure:
```
\opt
  \unitybase
    \server                 # ub server (installed by rpm/deb) 
    \products               # products (should be installed by app developer)
        \docflow
        \scriptum
        \deals
        \docflow-bpm
        ...
    \apps-available         # available applications (products what configured for certain customer)                   
        dkc-lin.docflow-bpm.json
        dkc-lin.docflow-bpm.env
        crb.docflow.json
        crb.docflow.env
        inbase.deals.json
        inbase.deals.env
    \apps-enabled           # symlinks from apps-available
        dkc-lin.docflow-bpm.json -> ../apps-available/dkc-lin.docflow-bpm.json
        dkc-lin.docflow-bpm.env  -> ../apps-available/dkc-lin.docflow-bpm.env
    \data                   # applications data
        \dkc-lin.docflow-bpm
            \db
            \store
            \models
                \vendor
                \cust
         
        
    
             

\usr\lib\systemd\system
  unitybase@.service        # UnityBase vendor unit. Do not edit it directly - see overriding topic below   
```
where

## Starting application as a service

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
## Setup logging

```shell script
# Create a log directory to allow journals to be stored on disk
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
```

Add a unitybase journald logging namespace config `/etc/systemd/journald@unitybase.conf` and add (replace) these lines:

Restart journald to apply new changes
```shell script
systemctl force-reload systemd-journald
```

## Use logs

```shell script
# all logs for all UnityBase services since last boot
journalctl --boot -u unitybase*
# errors, warnings and notices starting from 9:00 for autotest app
journalctl --since 09:00 --until now -u unitybase@autotest -p notice
```

Export logs to LogView format:
```shell script
journalctl -u unitybase@autotest --no-hostname -o short-iso-precise --since today _COMM=ub > todaysLog.log
```

 - show all logs (tail)
 journalctl -u ub_autotest -f


## Overriding a default application startup rules 

systemctl edit unit
systemctl revert unit

/etc/systemd/system
# reload unit config after edit
 sudo systemctl daemon-reload

POSTINSTALL
systemctl enable unitybase@.service

RUN

NODE_PATH=`pwd`/node_modules UB_CFG=/opt/unitybase/data/ubConfig.json ./tsql3.sh
