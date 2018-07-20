#!/usr/bin/env node

const server = require('./server.js')
const program = require('commander')

program
  .option('-l, --port [n]', 'Port HMR server will listen on', 5776)
  .option('-u --user [adminUserName]', 'UB user name with admin rights', process.env.UB_USER)
  .option('-p --pwd [password]', 'UB user password', process.env.UB_PWD)
  .option('-host --host [UB host]', 'host UB listen on', 'http://localhost:8881')
  .option('--poll', 'Use polling (may leads to high CPU utilization)', false)
  .option('-d --depth [n]', 'Limits how many levels of subdirectories will be traversed', 3)
  .option('-q, --quiet', 'do not harm console', false)
  .parse(process.argv)

let opts = {
  port: program.port,
  user: program.user,
  pwd: program.pwd,
  host: program.host,
  poll: program.poll,
  quiet: program.quiet,
  depth: program.depth
}

server(opts)
