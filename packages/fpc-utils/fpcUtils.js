const shell = require('shelljs')
const chalk = require('chalk')

/**
 * Cross compile unitybase native package using modes, defined in lpi
 * By Default consider lpi contains ReleaseLinux & ReleaseWin64 build modes
 * @example
 *
 *    const fpcUtils = require('@unitybase/fpc-utils')
 *    fpcUtils.lazCrossCompile('./src/ubcompressors.lpi')
 *
 * @param {string} pathToLpi
 * @param {Array<string>} modes
 */
function lazCrossCompile (pathToLpi, modes = ['ReleaseLinux', 'ReleaseWin64']) {
  console.info('Start compile ' + chalk.underline(pathToLpi) + chalk.bold(' on ') + chalk.green(process.platform))
  let LAZ_PATH = process.env.LAZARUS_PATH
  if (!LAZ_PATH) {
    console.error(chalk.yellow('LAZARUS_PATH environment variable must be defined (usually ~/fpcupdeluxe/lazarus)'))
    shell.exit(1)
  }
  let UB_SRC = process.env.UB_SRC
  if (!UB_SRC) {
    console.error(chalk.yellow('UB_SRC environment variable must be defined (usually ~/dev/ub-server)'))
    shell.exit(1)
  }
  chalk.reset()
  for (let i = 0, L = modes.length; i < L; i++) {
    shell.exec(`${LAZ_PATH}/lazbuild --build-mode=${modes[i]} -q ${pathToLpi}`)
    if (shell.error()) {
      console.error(chalk.red(`Error compiling ${modes[i]} target`))
      shell.exit(1)
    } else {
      console.info(chalk.green(`${modes[i]} target compiled`))
    }
  }
  shell.exit(0)
}

module.exports = {
  lazCrossCompile
}
