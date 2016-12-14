/**
 * User: pavel.mash
 * Date: 23.01.14
 * This test connect to UB server and do select for all entities
 */
var
    assert = require('assert'),
    ok = assert.ok,
    fs = require('fs'),
    argv = require('@unitybase/base/argv'),
    session, conn, outputPath, domain;

if (argv.findCmdLineSwitch('help') !== -1){
    console.info([
        'This test connect to UB server and do select for all entities',
        'Usage: ',
            '>UB PathToUB\models\UB\_autotest\020_selectForAllEntity.js ' + argv.establishConnectionFromCmdLineAttributesUsageInfo
    ].join('\r\n'));
    return;
}

session = argv.establishConnectionFromCmdLineAttributes();
conn = session.connection;
outputPath = argv.findCmdLineSwitchValue('out') || process.cwd();

try {
    domain = conn.getDomainInfo();
    console.time('selectAll');
    testAllSelect(conn, domain);
    console.timeEnd('selectAll');
} finally {
    session.logout();
}

/**
 *
 * @param {UBConnection} conn
 * @param {UBDomain} domain
 */
function testAllSelect(conn, domain){
    var
        recCnt = 0, ettCnt = 0,
        res;
    domain.eachEntity(function(entity, eName){
        "use strict";
        if (entity.haveAccessToMethod('select')){
            console.debug('run select for %s', eName);
            res = conn.Repository(eName).attrs(Object.keys(entity.attributes)).limit(10).selectAsArray();
            ok(typeof res === 'object' && res.resultData &&
                res.resultData.data && Array.isArray(res.resultData.data) &&
                res.resultData.rowCount === +res.resultData.rowCount, 'result is dataStore in array representation. Entity: ' + eName);
            recCnt += res.resultData.rowCount;
            ettCnt++;
        }else{
            console.debug('run select for %s. No "select" method permission. Test skipped', eName);
        }
    });
    console.debug('Entity tested %d. Rows selected %d', ettCnt, recCnt);
}

