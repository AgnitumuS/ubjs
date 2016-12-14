/**
 * User: felix
 * Date: 26.01.14
 * This test connect to UB server and do select for all entities
 */
var
    assert = require('assert'),
    fs = require('fs'),
    argv = require('@unitybase/base/argv'),
    session, conn, outputPath, domainInfo;

if (argv.findCmdLineSwitch('help') !== -1){
    console.info([
        'This test connect to UB server and do select for all entities',
        'Usage: ',
            '>UB -f cmd/generateDDL [-out outputFileName] [-e csvEntityList] [-m csvModelList] ' + argv.establishConnectionFromCmdLineAttributesUsageInfo,
        '  -e    Comma separated entity names list for test',
        '  -m    Comma separated model names list for test',
        '  -out  Folder to output generated DDLs (one file per connection). Default is cwd'
    ].join('\r\n'));
    return;
}

session = argv.establishConnectionFromCmdLineAttributes();
conn = session.connection;
outputPath = argv.findCmdLineSwitchValue('out') || process.cwd();

try {
    var config;

    domainInfo = conn.getDomainInfo();

    testCommon(conn);
} finally {
    session.logout();
}

function testCommon(conn){
    "use strict";
    var recCnt = 0, ettCnt = 0, res;

	console.debug('Test where item condition "LIKE"');

    assert.doesNotThrow(
      function(){ 
          conn.Repository('uba_user').attrs('ID', 'name').where('name', 'in', ['as:da', 'admin']).selectAsArray()
      },
      'string parameters with : inside must not throw'
    );
    
    // 1
	res = conn.Repository('uba_user')
		.attrs(['ID'])
        .where('[name]', 'like', 'admin')
		.limit(1)
		.selectAsArray();

    assert.equal(res.resultData.rowCount, 1, 'LIKE not work (1)');		

    // 2
	res = conn.Repository('uba_user')
		.attrs(['ID'])
        .where('[name]', 'like', 'ADMIN')
		.limit(1)
		.selectAsArray();

    assert.equal(res.resultData.rowCount, 1, 'LIKE not work (2)');		

    // 3
	res = conn.Repository('uba_user')
		.attrs(['ID'])
        .where('[name]', 'like', 'Admin')
		.limit(1)
		.selectAsArray();

    assert.equal(res.resultData.rowCount, 1, 'LIKE not work (3)');

    // 4
    res = conn.Repository('uba_user')
        .attrs(['ID'])
        .where('[ID]', 'in', [10, 20])
        .limit(3)
        .selectAsArray();
        
   // in subquery
   res = conn.Repository('uba_user')
        .attrs(['ID'])
        //.where('[ID]', 'in', [10, 20])
        .where('ID', 'in', conn.Repository('uba_user').attrs(['ID']).limit(1))
        .limit(3)
        .selectAsArray();

  //exists
  // who do not login during this year
  res = conn.Repository('uba_user')
        .attrs(['ID'])
        .notExists(
           conn.Repository('uba_audit')
             .correlation('actionUser','name')  // not a simple expression!
             .where('[actionTime]', '>', new Date(2016, 1, 1))
             .where('[actionType]', '=', 'LOGIN')
         )
         // but modify some data
         .exists(
           conn.Repository('uba_auditTrail')
             .where('[{master}.ID] =[ID]', 'custom') // here we link to uba_user.ID
             .where('[actionTime]', '>', new Date(2016, 1, 1))
         ).select()                  
}