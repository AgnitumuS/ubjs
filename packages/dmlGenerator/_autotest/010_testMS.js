/**
 * Created by v.orel on 05.01.2017.
 */
// const {MSSQLBuilder} = require('DMLGenerator')

const {MSSQLBuilder} = require('D:\\dev\\ubjs\\packages\\ub\\modules\\dmlGenerators\\DMLGenerator.js')
const builder = new MSSQLBuilder()
const assert = require('assert')
let query = {
  entity: 'uba_user',
  fieldList: ['ID']
}
let sql = builder.buildSelectQuery(query)
// builder.prepareQuery(null, null, sql, null, null)
assert.equal(sql, 'SELECT ID FROM uba_user')
// SELECT usr.ID  FROM uba_user usr

query = {
  entity: 'uba_user',
  fieldList: ['ID', 'name']
}
sql = builder.buildSelectQuery(query)
assert.equal(sql, 'SELECT ID,name FROM uba_user')
// SELECT usr.ID,usr.name  FROM uba_user usr

query = {
  entity: 'uba_user',
  fieldList: ['ID', 'name']
}
sql = builder.buildSelectQuery(query)
assert.equal(sql, 'SELECT ID,name FROM uba_user')
// SELECT usr.ID,usr.name  FROM uba_user usr
query = {
  entity: 'uba_user',
  fieldList: ['ID', 'name'],
  whereList: {
    cond: {
      expression: 'ID',
      condition: 'Equal',
      values: {
        '0': 10
      }
    }
  }
}
sql = builder.buildSelectQuery(query)
assert.equal(sql, 'SELECT usr.ID,usr.name  FROM uba_user usr  WHERE ID=?')
// SELECT usr.ID,usr.name  FROM uba_user usr  WHERE ID=?
// SELECT usr.ID,usr.name  FROM uba_user usr  WHERE ID=?

var {MSSQLBuilder} = require('D:\\dev\\ubjs\\packages\\ub\\modules\\dmlGenerators\\DMLGenerator.js')
var builder = new MSSQLBuilder()

var query = {
  entity: 'uba_userrole',
  fieldList: ['userID.name', 'ID'],
  whereList: {
    cond: {
      expression: 'ID',
      condition: 'Equal',
      values: {
        '0': 10
      }
    }
  }
}
var sql = builder.buildSelectQuery(query)
assert.equal(sql, 'SELECT usr.name,usrole.ID FROM uba_userrole usrole INNER JOIN uba_user usr ON usr.ID=usrole.userID WHERE usrole.ID=?')

sql

// SELECT usr.name,usrole.ID FROM uba_userrole usrole INNER JOIN uba_user usr ON usr.ID=usrole.userID WHERE usrole.ID=?
// SELECT usr.name,usrole.ID  FROM uba_userrole usrole  INNER JOIN uba_user usr ON usr.ID=usrole.userID  WHERE usrole.ID=?

var {MSSQLBuilder} = require('D:\\dev\\ubjs\\packages\\ub\\modules\\dmlGenerators\\DMLGenerator.js')
var builder = new MSSQLBuilder()

var query = {
  entity: 'cdn_organization',
  fieldList: [
    'mi_modifyUser.ID',
    'orgBusinessTypeID.mi_modifyUser.name',
    'ID',
    'orgBusinessTypeID.ID',
    '[mi_modifyUser.name]',
    '[mi_modifyUser.mi_modifyUser.name]'
  ],
  whereList: {
    cond: {
      expression: '[mi_modifyUser.ID]',
      condition: 'Equal',
      values: {
        '0': 10
      }
    }
  }
}
var sql = builder.buildSelectQuery(query)

sql

// SELECT usr.ID,usr2.name,org.ID AS ID2,orgbt.ID AS ID3,usr.name AS name2,usr3.name AS name3
// FROM cdn_organization org
// INNER JOIN uba_user usr ON usr.ID=org.mi_modifyUser
// LEFT JOIN cdn_orgbusinesstype orgbt ON orgbt.ID=org.orgBusinessTypeID
// INNER JOIN uba_user usr3 ON usr3.ID=usr.mi_modifyUser
// LEFT JOIN uba_user usr2 ON usr2.ID=orgbt.mi_modifyUser
// WHERE usr.ID=?

// SELECT usr.ID,usr2.name,org.ID AS ID2,orgbt.ID AS ID3,usr.name AS name2,usr3.name AS name3
// FROM cdn_organization org
// INNER JOIN uba_user usr ON usr.ID=org.mi_modifyUser
// LEFT JOIN cdn_orgbusinesstype orgbt ON orgbt.ID=org.orgBusinessTypeID
// INNER JOIN uba_user usr3 ON usr3.ID=usr.mi_modifyUser
// LEFT JOIN uba_user usr2 ON usr2.ID=orgbt.mi_modifyUser
// WHERE usr.ID=?