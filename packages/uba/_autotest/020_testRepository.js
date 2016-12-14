/**
 * User: pavel.mash
 * Date: 24.09.14
 * This UBRepository test
 */
var
  assert = require('assert'),
  ok = assert.ok,
  fs = require('fs'),
  argv = require('@unitybase/base/argv'),
  session, conn

function testRepository () {
  'use strict'
  var data, row,
    repository = conn.Repository('uba_user').attrs(['ID', 'name']).where('ID', '=', 10)

  console.debug('test Repository.selectAsObject')
  data = repository.selectAsObject()
  ok(Array.isArray(data), 'result is array')
  assert.equal(data.length, 1, 'array on 1 element')
  ok(typeof data[0] === 'object', 'element is object')
  ok((data[0].ID === 10) && (data[0].name === 'admin'), 'object is { ID: 10, name: "admin" }')

  console.debug('test Repository.selectAsArray')
  data = repository.selectAsArray()
  ok(typeof data == 'object', 'result is object')
  ok(data.resultData, 'result have resultData property')
  data = data.resultData.data
  ok(Array.isArray(data), 'result is array')
  assert.equal(data.length, 1, 'array on 1 element')
  row = data[0]
  ok(Array.isArray(row), 'element is array')
  ok((row[0] === 10) && (row[1] === 'admin'), 'array is [10, "admin"]')
//    data = repository.selectAsArray(true);
//    ok(data === '[{"entity":"uba_user","method":"select","fieldList":["ID","name"],"resultData":{"fields":["ID","name"],"rowCount": 1, "data":[[10,"admin"]]}}]',
//        'plain text result is wrong');
}

console.debug('Start UB.Repository test')
session = argv.establishConnectionFromCmdLineAttributes()
conn = session.connection

try {
  testRepository()
} finally {
  session.logout()
}

