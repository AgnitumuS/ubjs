const shell = require('shelljs')

shell.echo('We run on ' + process.platform)
if (process.platform === 'win32') {
  shell.exit(shell.exec('.\\bin\\compileFPC.cmd').code)
} else { // posix
  shell.exit(shell.exec('./bin/compile.sh').code)
}
