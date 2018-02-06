var shell = require('shelljs');
var process = require('process');

shell.echo('We run on ' + process.platform);
if (process.platform === 'win32')
  shell.exit(shell.exec('.\\bin\\compile.cmd').code || 1);
else // posix - currently has non cross-platform implementation
  shell.exit(0); // shell.exec('./bin/compile.sh');
