/**
 * @author pavel.mash
 * Set Entity level security basic rules
 */

/**
 * Initial script for Set Entity level security basic rules for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function(session) {
    "use strict";
    var csvLoader = require('@unitybase/base').dataLoader, conn = session.connection;

    console.info('\tFill ELS for UBS model');
    csvLoader.loadSimpleCSVData(conn, __dirname + '/ubs_els.csv', 'uba_els', 'code;entityMask;methodMask;ruleType;ruleRole;description'.split(';'), [
	0, 1, 2, 3, 
	function(row){
		if( typeof row[4] === 'number' ) {
			return 	row[4];
		} else {
			return conn.lookup('uba_role', 'ID', {expression: 'name', condition: 'equal', values: {name: row[4]}});
		}
	},
	5], 1);
};

