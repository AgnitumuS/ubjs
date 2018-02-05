var shell = require('shelljs');
var process = require('process');

shell.echo('We run on ' + process.platform);
if (process.platform === 'win32')
  return shell.exec('.\\bin\\compile.cmd');
else // posix - currently has non cross-platform implementation
  return 0; // shell.exec('./bin/compile.sh');
