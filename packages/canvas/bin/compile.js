var shell = require('shelljs');
var process = require('process');

shell.echo('We run on ' + process.platform);
if (process.platform === 'win32') // currently does not compilable with FPC on Windows
  shell.exit(0); // shell.exit(shell.exec('.\\bin\\compileFPC.cmd').code);
else // posix - currently has non cross-platform implementation
  shell.exit(0); // shell.exec('./bin/compile.sh');
