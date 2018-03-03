const shell = require('shelljs')

shell.echo('We run on ' + process.platform)
if (process.platform === 'win32') { // currently does not compilable with FPC on Windows
  console.warn('FIX ME: canvas module Win')
  shell.exit(0) // shell.exit(shell.exec('.\\bin\\compileFPC.cmd').code);
} else { // posix - currently has non cross-platform implementation
  console.warn('FIX ME: canvas module Linux')
  shell.exit(0) // shell.exec('./bin/compile.sh');
}
