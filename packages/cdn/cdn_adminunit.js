/**
 * Created by igor.borisov on 25.10.13.
 */
var me = cdn_adminunit;

/**
 * Update adminunit caption
 * @param {ubMethodParams} ctxt
 * @param {String} mode
 * @return {boolean}
 */
me.updateCaption = function (ctxt, mode) {
    var execParams = ctxt.mParams.execParams;
    var dataStore = ctxt.dataStore;

    var name = execParams.name;
    var parentAdminUnitID = execParams.parentAdminUnitID;
    console.debug('name:', name);
    console.debug('parentAdminUnitID:', parentAdminUnitID);

    if (name || parentAdminUnitID){ //check, that name or parentAdminUnitID has been changed
        //switching currentDataName to selectBeforeUpdate because we need isDummy field
//        var oldCurrentDataName = ctxt.dataStore.currentDataName;
        //        ctxt.dataStore.currentDataName = 'selectBeforeUpdate';
        if (mode !== "INS") {
            if (!name) {
                name = dataStore.get('name');
            }
            if (!parentAdminUnitID) {
                parentAdminUnitID = dataStore.get('parentAdminUnitID');
            }
            //        ctxt.dataStore.currentDataName = oldCurrentDataName;
        }


        if (parentAdminUnitID) {
            var info = getInfo(parentAdminUnitID);
            var parentName = info ? info.name : 'unknown'; //todo: localize unknown
            execParams.caption = name + ', ' + parentName;
        } else{
            execParams.caption = name;
        }
    }
    return true;
};

/**
 *
 * @param {number} id
 * @return {cdn_adminunit_object}
 */
function getInfo(id) {
    if (!id) {
        throw new Error('<<<cdn_adminunit.getInfo - admin unit ID not set>>>');
    }
    /**
     * @type cdn_adminunit_object
     */
    var info = UB.Repository('cdn_adminunit').attrs(['ID', 'name']).where('[ID]', '=', id).selectAsObject()[0];
    return info;
};
