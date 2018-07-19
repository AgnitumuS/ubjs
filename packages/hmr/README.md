[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# Hot Module Replacement for UB 

Module for watching changes in the public part of UnityBase and send notifications for UB adminUI in dev mode using web sockets

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