#!/usr/bin/env ub

const fs = require('fs')
const path = require('path')
// argv: executable ubcli command ...params
const command = process.argv[2]

/**
 * A simple CLI for scaffolding UnityBase projects.
 * Run `npx ubcli -help` in command line (or `ubcli --help` if installed globaly) for a full list of available commands
 *
 * @module @unitybase/ubcli
 */

// commands help
if (!command || (['-?', '/?', '-help', '/help'].indexOf(command) !== -1)) {
  let libsPath = path.join(__dirname, '..', 'lib')
  let commands = fs.readdirSync(libsPath)
  console.info('Possible commands:')
  for (let cmd of commands) {
    if (cmd.endsWith('.js')) {
      let shortDoc = ' ' + cmd.replace(/\.js$/, '').padEnd(20, ' ')
      try {
        let descr = require(path.join(libsPath, cmd)).shortDoc
        if (descr) shortDoc += ' - ' + descr
      } catch (e) {
      }
      console.log(shortDoc)
    }
  }
  console.log('Run ubcli commandName -? for a command help')
} else {
  const cmdModule = require(`../lib/${command}`)
  if (typeof cmdModule === 'function') cmdModule()
}
