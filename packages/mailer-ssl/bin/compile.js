var shell = require('shelljs');
var process = require('process');

shell.echo('We run on ' + process.platform);
if (process.platform === 'win32')
  shell.exec('.\\bin\\compile.cmd');
else // posix
  shell.exec('./bin/compile.sh');
