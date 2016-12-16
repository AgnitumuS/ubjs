/*global UB, Ext, Q*/
exports.reportCode = {
    /**
     * This function must be defined in report code block.
     *
     * Inside function you must:
     * 1) Prepare data
     * 2) Run method this.buildHTML(reportData); where reportData is data for mustache template
     * 3) If need create PDF run method this.transformToPdf(htmlReport); where htmlReport is HTML
     * 4) If is server side function must return report as string otherwise Promise
     *
     * @cfg {function} buildReport
     * @params {[]|{}} reportParams
     * @returns {Promise|Object} If code run on server method must return report data.
     * Promise object must resolve report code
     */
    buildReport: function(reportParams) {
        var 
          me = this, limit = reportParams.limitation || 1000,
            promise,
            LocalDataStore = UB.isServer ? require('LocalDataStore.js') : UB.LocalDataStore,
            QWhen = UB.isServer ? require('when') : Q;
        //debugger;
        promise = UB.Repository('cdn_country').attrs(['code', 'name', 'fullName', 'currencyID.name']).limit(limit);
        promise = QWhen.resolve(promise.selectAsArray()).then(function(response) {
                return LocalDataStore.selectResultToArrayOfObjects(response, {
                    'currencyID.name':  'currencyName'
                });
        })
        .then(function(data) {
            data = {
                countries: data,
                myBirthday: reportParams.birthday ? reportParams.birthday.toLocaleDateString() : UB.i18n('undefined'),
                myArray: [1, 2, 3],
                area: null,
                boldIfLong: function(){ return function (text, render){ 
                    	return (text.length > 3) ? '<b>' + text + '</b>' : text;
                	};
                }
            };
            var result = me.buildHTML(data);
            if (me.reportType === 'pdf') {
                result = me.transformToPdf(result);
            }
            return result;
        });
        return promise;
    },

    onParamPanelConfig: function() {
        var paramForm = Ext.create('UBS.ReportParamForm', {
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'Name'
            }, {
                xtype: 'datefield',
                name: 'birthday',
                fieldLabel: 'Birthday',
                allowBlank: false,
                value: new Date()
            },{
                xtype: 'numberfield',
                name: 'limitation',
                fieldLabel: 'Limit to'
            }
            ],
            getParameters: function(owner) {
                var frm = owner.getForm();
                return {
                    name: frm.findField('name').getValue(),
                    birthday: frm.findField('birthday').getValue(),
                    limitation: frm.findField('limitation').getValue()
                };
            }
        });
        return paramForm;
    }

};