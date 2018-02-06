var shell = require('shelljs');
var process = require('process');

shell.echo('We run on ' + process.platform);
if (process.platform === 'win32')
  shell.exit(shell.exec('.\\bin\\compileFPC.cmd').code);
else // posix
  shell.exit(0); // Com not available on Linux
