const shell = require('shelljs')
const chalk = require('chalk')

console.info(`We run on ${chalk.underline(process.platform)}`)
let LAZ_PATH = process.env.LAZARUS_PATH
if (!LAZ_PATH) {
  console.error(chalk.yellow('LAZARUS_PATH environment variable must be defined (usually ~/fpcupdeluxe/lazarus)'))
  shell.exit(1)
}
shell.exec(`$LAZARUS_PATH/lazbuild --build-mode=ReleaseLinux -q ./src/ubcompressors.lpi`)
if (shell.error()) {
  console.error(chalk.red(`Error compiling linux target`))
  shell.exit(1)
} else {
  console.info(chalk.green('Linux target compiled'))
}
shell.exec(`$LAZARUS_PATH/lazbuild --build-mode=ReleaseWin64 -q ./src/ubcompressors.lpi`)
if (shell.error()) {
  console.error(chalk.red(`Error compiling Win64 target`))
  shell.exit(1)
} else {
  console.info(chalk.green('Win64 target compiled'))
}
shell.exit(0)
