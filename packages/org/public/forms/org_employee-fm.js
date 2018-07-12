/*global UB, UB, Ext, DMP */
exports.formCode = {
    dataBind: {
        fullFIO: {
            value: '({lastName} || "?") + " " + ({firstName} || "?") + ({middleName} ? " " + {middleName}:"")'
            //visible: '([taskType] === "ONDATE")'
        },
        shortFIO: {
            value: '({lastName} || "?") + " " + ({firstName} || "?")[0].toUpperCase() + "." + ({middleName} ? {middleName}[0].toUpperCase() + "." : "")'
        },
        lastNameGen: {
            value: '{lastName}'
        },
        lastNameDat: {
            value: '{lastName}'
        },
        lastNameObj: {
            value: '{lastName}'
        },
        firstNameGen: {
            value: '{firstName}'
        },
        firstNameDat: {
            value: '{firstName}'
        },
        firstNameObj: {
            value: '{firstName}'
        },
        middleNameGen: {
            value: '{middleName}'
        },
        middleNameDat: {
            value: '{middleName}'
        },
        middleNameObj: {
            value: '{middleName}'
        },
        shortFIOGen: {
            value: '{shortFIO}'
        },
        shortFIODat: {
            value: '{shortFIO}'
        },
        shortFIOObj: {
            value: '{shortFIO}'
        },
        fullFIOGen: {
            value: '{fullFIO}'
        },
        fullFIODat: {
            value: '{fullFIO}'
        },
        fullFIOObj: {
            value: '{fullFIO}'
        },
        applyGen: {
            value: '{apply}'
        },
        applyDat: {
            value: '{apply}'
        },
        applyObj: {
            value: '{apply}'
        }
    },


    initUBComponent: function () {
        UBS.dataBinder.applyBinding(this);
    }
}; 