/* global org_borderunit, org_department, org_staffunit, org_employeeonstaff, org_organization */
var me = org_borderunit;

me.entity.addMethod('selectByUnit');

me.on('select:before', function (ctxt) {
    var params = ctxt.mParams, unitID;
    if (params.filterByOwnUnit) {
        unitID = me.getBorderUnit();
        if (unitID && (unitID !== '-1')) {
            if (!params.whereList) {
                params.whereList = {};
            }
            params.whereList.byUnitR = {
                expression: '[orgUnitID.mi_treePath]',
                condition: 'startWith',
                values: {orgUnitID: unitID}
            };
            /*
             params.whereList.byUnitR = {
             expression: '[orgUnitID]',
             condition: 'equal',
             values: {orgUnitID: unitID}
             };
             */
        }
    }
});


me.selectByUnit = function (ctxt) {
    var store = ctxt.dataStore,
        request = ctxt.mParams,
        unitID = me.getBorderUnitID();

    if (unitID && (unitID !== '-1')) {
        if (!request.whereList) {
            request.whereList = {};
        }
        request.whereList.byUnitR = {
            expression: '[orgUnitID]',
            condition: 'equal',
            values: {orgUnitID: me.getBorderUnitID()}
        };
    }
    store.run('select', request);
};

me.getBorderUnitRead = function () {
    if (!Session.uData.userBorderUnitPathRead) {
        if (!Session.uData.staffUnitID || Session.uData.staffUnitID < 0) {
            // do not limit SQL in onLogin event
            return '-1';
        }
        var borderUnit = me.getBorderUnit(), roles;
        roles = (Session.userRoleNames || '').split(',');
        if (roles.indexOf('orgAllNodeAccess') >= 0) {
            Session.uData.userBorderUnitPathRead = '-1';
        } else {
            Session.uData.userBorderUnitPathRead = borderUnit;
        }

        if (Session.uData.userBorderUnitID && Session.uData.userBorderUnitID !== -1) {
            var depsInUnit = UB.Repository('org_unit')
                .attrs(['ID'])
                .where('unitType', 'equal', 'DEP')
                .where('mi_treePath', 'like', borderUnit)
                .selectAsArray();
            Session.uData.userBorderUnitDepartmentsID = _.flatten(depsInUnit.resultData.data).join(',');
        } else {
            Session.uData.userBorderUnitDepartmentsID = '';
        }
    }
    return Session.uData.userBorderUnitPathRead;
};

me.getBorderUnitID = function () {
    if (!Session.uData.userBorderUnitID) {
        me.getBorderUnit();
    }
    return Session.uData.userBorderUnitID || '-1';
};


/**
 * Function returns border unit path for current user.
 * If the node security is disabled or current user does not have active staff it will return '-1'.
 * @returns {String}
 */
me.getBorderUnit = function () {
    var borderUnits,
        unit,
        staffUnitID,
        parentUnitIDs = [],
        unitIDs, unitID;

    function trim(strIn, symb) {
        var startS = 0, endS = strIn.length - 1, changed = false;
        while (strIn[startS] === symb) {
            changed = true;
            startS++;
        }
        while (strIn[endS] === symb) {
            changed = true;
            endS--;
        }
        if (!changed) {
            return strIn;
        }
        return strIn.substring(startS, endS + 1);
    }

    if (!Session.uData.userBorderUnitPath) {
        // Check that the node security is disabled.
        borderUnits = UB.Repository('org_borderunit').
            attrs(['ID', 'orgUnitID']).
            select();
        //orgUnitNodeSecurity =  borderUnits.rowCount === 0 ? 'false': 'true';
        if (borderUnits.rowCount === 0) {
            Session.uData.userBorderUnitPath = '-1';
            Session.uData.userBorderUnitID = '-1';
            return Session.uData.userBorderUnitPath;
        }
        if (global.md_user) {
            // !!!! get unit from md_user if enabled model md
            if (!Session.userID || Session.userID <= 0) {
                return '-1';
            }
            Session.uData.userBorderUnitPath = '-1';
            Session.uData.userBorderUnitPath = '-1';
            unit = UB.Repository('md_user').
                attrs(['unitID']).
                where('[userID]', '=', Session.userID).
                select();
            if (unit.rowCount > 0) {
                unitID = unit.get('unitID');
                Session.uData.userBorderUnitID = unitID;
                borderUnits = UB.Repository('org_borderunit').
                    attrs(['ID', 'orgUnitID', 'orgUnitID.mi_treePath']).
                    where('[ID]', 'equal', unitID).
                    select();
                if (!borderUnits.eof) {
                    Session.uData.userBorderUnitPath = borderUnits.get('orgUnitID.mi_treePath');
                }

            }
            unit.freeNative();
            return Session.uData.userBorderUnitPath;
        }
        // !!! get unit by staff if disabled model md
        if (!Session.uData.staffUnitID || Session.uData.staffUnitID < 0) {
            // do not limit SQL in onLogin event
            return '-1';
        }
        Session.uData.userBorderUnitPath = '-1';

        staffUnitID = Session.uData.staffUnitID; //employeeOnStaffID
        if (staffUnitID) {
            unit = UB.Repository('org_unit').
                attrs(['ID', 'mi_treePath']).
                where('[ID]', '=', staffUnitID).
                select();
            while (!unit.eof) {
                unitIDs = trim(unit.get('mi_treePath') || '', '/').split('/');
                parentUnitIDs = parentUnitIDs.concat(unitIDs);
                unit.next();
            }
            unit.freeNative();
            borderUnits = UB.Repository('org_borderunit').
                attrs(['ID', 'orgUnitID', 'orgUnitID.mi_treePath']).
                where('[orgUnitID]', 'in', parentUnitIDs).
                orderBy('orgUnitID.mi_treePath', 'desc').
                select();
            if (!borderUnits.eof) {
                Session.uData.userBorderUnitPath = borderUnits.get('orgUnitID.mi_treePath');
                Session.uData.userBorderUnitID = borderUnits.get('ID');
            }
            borderUnits.freeNative();
        }
    }
    return Session.uData.userBorderUnitPath;
};


function checkBorderUnit(ID) {
    var borderUnit = me.getBorderUnit(), cmd, unit, roles;
    if (borderUnit === '-1' || !ID) {
        return;
    }
    roles = (Session.userRoleNames || '').split(',');

    unit = UB.Repository('org_unit').
        attrs(['ID', 'mi_treePath']).
        where('[ID]', '=', ID).
        where('[mi_treePath]', 'startWith', borderUnit).
        select();

    if ((unit.rowCount === 0) || (roles.indexOf('orgNodeAdmin') < 0)) {
        throw new Error('<<<' + UB.i18n('AccessDeny') + '>>>');
    }
    unit.freeNative();
}

function userCanModify(ctxt) {
    var execParams = ctxt.mParams && ctxt.mParams.execParams,
        ID = execParams && (execParams.parentID || execParams.ID);
    checkBorderUnit(ID);
}
function userCanModifyParent(ctxt) {
    var execParams = ctxt.mParams && ctxt.mParams.execParams,
        ID = execParams && execParams.parentID;
    checkBorderUnit(ID);
}
function userCanModifyStaffUnitIDIns(ctxt) {
    var execParams = ctxt.mParams && ctxt.mParams.execParams,
        ID = execParams && execParams.staffUnitID;
    checkBorderUnit(ID);
}
function userCanModifyStaffUnitID(ctxt) {
    var execParams = ctxt.mParams && ctxt.mParams.execParams,
        employeeonstaff, staffUnitID = execParams && execParams.staffUnitID,
        ID = execParams && execParams.ID;
    if (!staffUnitID) {
        employeeonstaff = UB.Repository('org_employeeonstaff').
            attrs(['ID', 'staffUnitID']).
            where('[ID]', '=', ID).
            misc({__mip_recordhistory_all: true}).
            select();
        staffUnitID = employeeonstaff.get('staffUnitID');
        employeeonstaff.freeNative();
    }
    checkBorderUnit(staffUnitID)
}

org_department.on('insert:before', userCanModifyParent);
org_department.on('update:before', userCanModify);
org_department.on('update:after', userCanModify);
org_department.on('delete:before', userCanModify);

org_staffunit.on('insert:before', userCanModifyParent);
org_staffunit.on('update:before', userCanModify);
org_staffunit.on('update:after', userCanModify);
org_staffunit.on('delete:before', userCanModify);


org_organization.on('insert:before', userCanModifyParent);
org_organization.on('update:before', userCanModify);
org_organization.on('update:after', userCanModify);
org_organization.on('delete:before', userCanModify);


org_employeeonstaff.on('insert:before', userCanModifyStaffUnitIDIns);
org_employeeonstaff.on('update:before', userCanModifyStaffUnitID);
org_employeeonstaff.on('delete:before', userCanModifyStaffUnitID);

/*
 uba_user.on('select:before', function(ctxt){
 var params = ctxt.mParams, borderUnit = me.getBorderUnitRead;
 if (borderUnit === '-1'){
 return;
 }
 if (!params.whereList){
 params.whereList = {};
 }
 params.whereList.limitByOrgBorderUnit = {
 expression: '[ID]',
 condition: 'subquery',
 subQueryType: 'in',
 values: {
 entity: 'org_employeeonstaff',
 fieldList: ['employeeID.userID']
 ,
 "whereList": {
 "w": {
 "expression": "[employeeID.userID] = udiskc.ID",
 "condition": "custom"
 },
 "w1": {
 "expression": "[staffUnitID.unit.mi_treePath] = udiskc.ID",  // udiskc - sqlAlias from domainEntity
 "condition": "custom"
 },
 }

 }
 };
 });
 */