/*global UB, App, Session, ubs_filter */
var me = ubs_filter;
me.entity.addMethod('beforeinsert');
/**
 *
 * @param {ubMethodParams} ctxt
 * @returns {boolean}
 */
me.beforeinsert = function(ctxt) {
    var  execParams = ctxt.mParams.execParams;
    execParams.owner = Session.userID;
    return true;
};

