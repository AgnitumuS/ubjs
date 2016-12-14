/**
 * Created by igor.borisov on 25.10.13.
 */
var me = cdn_city;
me.entity.addMethod('afterbeforeinsert');
me.entity.addMethod('afterbeforeupdate');

me.afterbeforeinsert = function (ctxt) {
    cdn_adminunit.updateCaption(ctxt, "INS");
    return true;
};

me.afterbeforeupdate = function (ctxt) {
    cdn_adminunit.updateCaption(ctxt, "UPD");
    return true;
};


