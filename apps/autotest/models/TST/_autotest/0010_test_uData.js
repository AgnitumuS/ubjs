/**
 * Created by pavel.mash on 25.05.2015.
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
    console.debug('test_uData');
    testUData(conn);
} finally {
    session.logout();
}

/**
 *  Test uData is Object and it persisted only on Session.on('login');
 * @param {UBConnection} conn
 */
function testUData(conn){
    // check it filled
    conn.run({
        entity: 'tst_service',
        method: 'uDataTest'
    });
    // and if we define something in uData not in Session.on(login) nothing changed
    conn.run({
        entity: 'tst_service',
        method: 'uDataTest'
    });
}

function testDataStore(conn){
    assert.throws(function(){
        conn.run({
        entity: 'tst_service',
        method: 'testDataStoreInitialization'
      });
    }, /Wrong JSON/, 'Wrong JSON do not raise AV');
    
}

