exports.formCode = {
    dataBind: {
        fullName: {
            value: '{name}'
        },
        addrText: {
            value: '{name}'
        },
        nameDat: {
            value: '{name}'
        },
        nameGen: {
            value: '{name}'
        },
        fullNameDat: {
            value: '{fullName}'
        },
        fullNameGen: {
            value: '{fullName}'
        }
    },
    initUBComponent: function () {
        UBS.dataBinder.applyBinding(this);
	}

};