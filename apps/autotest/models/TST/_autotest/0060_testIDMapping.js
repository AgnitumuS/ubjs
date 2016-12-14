/**
 * Created by pavel.mash on 28.08.2015.
 */

var
    assert = require('assert'),
    fs = require('fs'),
    argv = require('@unitybase/base').argv,
    session, conn;

if (argv.findCmdLineSwitch('help') !== -1){
    console.info([
        'Test clobTruncate mixin. tst_clob entity require',
        'Usage: ',
            '>UB ' + __fileName + ' ' + argv.establishConnectionFromCmdLineAttributesUsageInfo
    ].join('\r\n'));
    return;
}

session = argv.establishConnectionFromCmdLineAttributes();
conn = session.connection;

try {
    console.debug('test ID mapping');
    testIDMapping(conn);
} finally {
    session.logout();
}

/**
 * Issue UB-1219: Ошибка при удалении, если для ID используется mapping
 * @param {UBConnection} conn
 */
function testIDMapping(conn){
    // add new
    var ID = conn.insert({
        entity: 'tst_IDMapping',
        fieldList: ['ID'],
        execParams: { code: 'testIDMap'}
    });
    // delete it
    conn.run({
        entity: 'tst_IDMapping',
        method: 'delete',
        execParams: {ID: ID}
    });
}

