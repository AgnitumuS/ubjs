var shell = require('shelljs');
var process = require('process');

shell.echo('We run on ' + process.platform);
if (process.platform === 'win32')
  shell.exit(shell.exec('.\\bin\\compile.cmd').code);
else // posix
  shell.exit(shell.exec('./bin/compile.sh').code);
