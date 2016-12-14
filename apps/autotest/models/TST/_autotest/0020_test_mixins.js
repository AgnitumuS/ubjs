/**
 * User: pavel.mash
 * Date: 17.10.14
 * Test clobTruncate mixin
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
    console.debug('testClobTruncate');
    testClobTruncate(conn);
    console.debug('testDateTime');
    testDateTime(conn);
	console.debug('test param macros');
	testParamMacros(conn);
} finally {
    session.logout();
}

/**
 * @param {UBConnection} conn
 */
function testClobTruncate(conn){
    "use strict";
    var s200 = '1234567890'.repeat(2000), insertedIDs = [];

    var values2insert = [{
            code: '1truncate', text100: s200, text2: s200
        }, {
            code: '2strip', text100: '<i>' + s200 + '<i>', text2: '<b><i>' + s200 + '</b></i>'
        }, {
            code: '3empty', text100: null, text2: '<b><i></b></i>'
        }, {
            code: '4strip', text100: '<a>a&gt;b&lt;&nbsp;c &amp;Y&quot;</a>', text2: '<a>a&gt;b</a>'
        }],
        mustBe = [{
            code: '1truncate', mi_tr_text100: s200.substr(0, 100), mi_tr_text2: s200.substr(0, 2)
        }, {
            code: '2strip', mi_tr_text100: s200.substr(0, 100), mi_tr_text2: s200.substr(0, 2)
        },  {
            code: '3empty', mi_tr_text100: null, mi_tr_text2: null
        }, {
            code: '4strip', mi_tr_text100: 'a>b< c &Y"', mi_tr_text2: 'a>'
        }];

    values2insert.forEach(function(item){
        insertedIDs.push(conn.insert({
            entity: 'tst_clob',
            fieldList: ['ID'],
            execParams: item
        }));
    });

    var inserted = conn.Repository('tst_clob').attrs(['code', 'mi_tr_text100', 'mi_tr_text2']).orderBy('code').selectAsObject();
//    console.log('actual:', inserted);
//    console.log('expect:', mustBe);

    assert.deepEqual(inserted, mustBe);

    var html2strip = fs.readFileSync(__dirname + './fixtures/html2strip.html');
    var updated = conn.run({
        entity: 'tst_clob',
        method: 'update',
        fieldList: ['mi_tr_text2000'],
        execParams: {
            ID: insertedIDs[0],
            text2000:html2strip
        }
    });
    assert.equal(updated.resultData.data[0][0], '1\r\n3');

    html2strip = fs.readFileSync(__dirname + './fixtures/html2stripHuge.html');
    updated = conn.run({
        entity: 'tst_clob',
        method: 'update',
        fieldList: ['mi_tr_text2000'],
        execParams: {
            ID: insertedIDs[1],
            text2000: html2strip
        }
    });
    var truncatedHuge = fs.readFileSync(__dirname + './fixtures/html2stripHuge.txt');
    assert.equal(updated.resultData.data[0][0], truncatedHuge);

    var mResult = conn.run({entity: 'tst_service', method: 'multiply', a: 2, b: 3});
    assert.equal(mResult.multiplyResult, 2*3);
    // test listeners removed - not work!! must me removed in ALL threads
//    conn.post('evaluateScript', 'tst_service.removeAllListeners("multiply:before"); return {res: true}');
//    mResult = conn.run({entity: 'tst_service', method: 'multiply', a: 200, b: 300});
//    assert.equal(mResult.multiplyResult, 200*300);
	
    var emitterLog = conn.post('evaluateScript', 'return {res: App.globalCacheGet("eventEmitterLog")}');
    mustBe = 'insert:before;insert:after;'.repeat(values2insert.length) +  'multiply:before;multiply:after;';
    assert.equal(emitterLog.res, mustBe);
}

/**
 *
 * @param {UBConnection} conn
 */
function testDateTime(conn){
    var
        dayDate = new Date(),
        row2Insert, inserted;

    dayDate.setMilliseconds(0);
    row2Insert = {
        code: '2014-01-01',
        docDate: dayDate,
        docDateTime: dayDate
    };

    inserted = conn.insert({
        entity: 'tst_document',
        fieldList: ['code', 'docDate', 'docDateTime'],
        execParams: row2Insert
    });
    assert.equal(row2Insert.code, inserted[0], 'time-like string value should not be converted into the time');
    assert.equal(row2Insert.docDate.getTime(), Date.parse(inserted[1]), 'date field w/o time');
    assert.equal(row2Insert.docDateTime.getTime(),  Date.parse(inserted[2]), 'date0-time field');
}


/**
 *
 * @param {UBConnection} conn
 */
function testParamMacros(conn){

	//Этот тест проверяет, насколько корректно построитель запросов обрабатывает символ '#', на который начинаются некоторые макросы
	//Тест начался еще на этапе заполнения таблицы 'tst_maindata', где в 2 записи добавлены макросы
    console.debug('Проверка кол-ва записей в таблице, где значение атрибута "code" начинается с символа "#"');
    var selected = conn.run({
        entity: 'tst_maindata',
		method: 'select',
        fieldList: ['ID', 'code'],
		whereList: {
			w1: {
				expression: '[code]',
				condition: 'like',
				values: {v1: '#Код'}
			}
		}
    });
	//Должно быть 2 записи
    assert.equal(selected.resultData.rowCount, 2);

    console.debug('Проверка кол-ва записей в таблице, у которых на этапе заполнения данных проставилось значение "максимальной даты" в атрибут "dateTimeValue" макросом "#maxdate"');
    var selected = conn.run({
        entity: 'tst_maindata',
		method: 'select',
        fieldList: ['ID', 'dateTimeValue'],
		whereList: {
			w1: {
				expression: '[dateTimeValue]',
				condition: '=',
				values: {v1: '#maxdate'}
			}
		}
    });
	//Должно быть 1 запись
    assert.equal(selected.resultData.rowCount, 1);

    console.debug('Проверка кол-ва записей в таблице, у которых на этапе заполнения данных проставилось значение "даты" в атрибут "dateTimeValue" макросом "#maxdate" и макросом "#currentdate"');
    var selected = conn.run({
        entity: 'tst_maindata',
		method: 'select',
        fieldList: ['ID', 'dateTimeValue'],
		whereList: {
			w1: {
				expression: '[dateTimeValue]',
				condition: 'isNotNull'
			}
		}
    });
	//Должно быть 2 записи
    assert.equal(selected.resultData.rowCount, 2);
}
