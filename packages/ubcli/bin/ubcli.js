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
  let commands = fs.readdirSync(path.join(__dirname, '..', 'lib'))
  console.info('Possible commands:')
  for (let cmd of commands) {
    if (cmd.endsWith('.js')) {
      console.log('\t', cmd.replace(/\.js$/, ''))
    }
  }
  console.log('\r\nRun ubcli commandName -? for a command help')
} else {
  const cmdModule = require(`../lib/${command}`)
  if (typeof cmdModule === 'function') cmdModule()
}
