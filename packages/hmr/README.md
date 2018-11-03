[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# Hot Module Replacement for UB 

Module for watching changes in the `public` part of UnityBase models and sending notifications for UB adminUI HMR (in dev mode)

## Usage
 ```
 npm i -D @unitybase/hmr
 cd yourAppFolder
 ub -dev
 npx ub-hmr -u admin -p admin
 ```

 Open browser with adminUI in dev mode

 Edit UB form or module in your editor
 In browser reopen new form
 Enjoy!
 
 ## FAQ
 
 ### I got ENOSPC exception while running ub-hmr on Linux 
 You should increase maximum number of system watchers on IO level
 
 Check current value 
 ```bash
 cat /proc/sys/fs/inotify/max_user_watches
 ```
 Increase it
 ```bash
 echo fs.inotify.max_user_watches=32000 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
 ```

### I run both ub & ub-hmr but file content not changed in browser
If you configure ub to use nginx as reverse proxy and generate config using
```
ubcli generateNginxCfg
```
then set extpires to -1 in `ub_proxy.conf` for /app location

See comment inside ub_proxy.conf

Don't forgot to reload nginx config
```bash
sudo nginx -s reload
```

### Do I need to restart ub-hmr after restarting ub?
No, if you restart UB with the same ubConfig 

## Do I need to restart ub-hmr after restarting browser / reloadig page?
No
