require('../view/EntityGridPanel')
/**
 * Container for detail grid. Create grid, based on passed `cmdData` (the same as for showList) and add to `whereList`
 * condition `detailFields` values = `masterFields` values.
 *
 * Configuration sample:
 *
 *          {
                xtype: "ubdetailgrid",
                entityConfig: {
                        entity: "uba_userrole",
                        method: "select",
                        fieldList: ["roleID"]
                },
                masterFields: ["ID"],
                detailFields: ["userID"]
            }
 *
 * @author UnityBase core team
 */

Ext.define("UB.ux.UBDetailGrid", {
    extend: "UB.view.EntityGridPanel",
    alias: "widget.ubdetailgrid",

    uses: [
        "UB.core.UBApp",
        "UB.core.UBCommand"
    ],

    layout: "fit",
    //margin: '5 0 0 5',
    /**
     * @cfg {Boolean} readOnly
     * Read-only grid do not show actions: `addNew`,  `addNewByCurrent`, `del`, `edit`, `newVersion`.
     */
    readOnly: false,

    /**
     * @cfg {Array.<String>} masterFields Master attribute name(s) from parent.record for master-detail
     */
    masterFields: [],
    /**
     * @cfg {Array.<String>} detailFields Detail attribute name(s) for master-detail
     */
    detailFields: [],
    initComponent: function() {
        var me = this,
            cmdParams;

        if (me.cmpInitConfig){
            console.warn('cmpInitConfig parameter is deprecated. You can set parameters from cmpInitConfig into UBDetailGrid config.');
            Ext.apply(me, me.cmpInitConfig);
        }
        me.disableAutoLoadStore = true;
        cmdParams = me.cmdData && me.cmdData.params ? me.cmdData.params[0] : null;
        if (cmdParams && !me.entityConfig){ // for backward compatibility
            me.entityConfig = cmdParams;
        }
        if (me.cmdData){
            console.debug('UBDetailGrid: cmdData cfg parameter is deprecated. Use entityConfig');
        }
        if (me.cmdType && this.cmdType !== 'showList'){
            throw new Error('UB.ux.UBDetailGrid show only grid');
        }
        // for backward compatibility
        me.grid = me;
        me.gridCreated = true;

        /*
        if(me.masterFields && me.detailFields && cmdParams){
            me.parentContext = me.parentContext || {};
            _.forEach(me.masterFields, function(masterField, index){
                me.parentContext[me.detailFields[index]] = record.get(masterField);
            }, me);

            cmdParams.whereList = UB.core.UBCommand.addMasterDetailRelation(cmdParams.whereList, this.masterFields, this.detailFields, record);
            //cmdParams.detailFields = me.detailFields;
        }
        */


        this.callParent(arguments);

        // only for Banay Vasily
        if (_.isFunction(me.customInit)) {
            me.customInit.call(me);
        }

        $App.domainInfo.get(me.entityConfig.entity).checkAttributeExist(me.detailFields, 'UB.ux.UBDetailGrid, detailFields:');

        /**
         * @deprecated Grid is created immediately
         * @event  gridCreated
         * Fire when grid was created.
         */
        me.addEvents('gridCreated');
        //me.fireEvent('gridCreated', me);
        if (this.isDesignMode){ // for visual designer forms
            try {
                this.setValue(null);
            } catch (e) {}
        }
    },

    on: function(ename, fn, scope, options){
       if (ename === 'gridCreated'){
           console.error('Deprecated. Grid is created immediately');
           fn.bind(scope || this).apply([this]);
       } else {
           this.callParent(arguments);
       }
    },


    /**
     *
     * @param {Ext.data.Model} record
     * @param {String} parentEntityName
     */
    setValue: function(record, parentEntityName) {
        var me = this;
        if (parentEntityName){
            $App.domainInfo.get(parentEntityName).checkAttributeExist(me.masterFields, 'UB.ux.UBDetailGrid, masterFields:');
        }
        if( me.masterFields && me.detailFields){
            me.parentContext = me.parentContext || {};
            _.forEach( me.masterFields, function(masterField, index){
                    if (!record.fields.findBy(function(item ){ return item.name === masterField; })){
                       throw new Error('Master entity record does not contains field "' + masterField +
                           '". This field used as parent field in UBDetailGrid. Detail entity = ' +
                           me.entityConfig.entity + ', master entity ' + parentEntityName );
                    }
                    me.parentContext[me.detailFields[index]] = record.get(masterField);
            });
       }
        me.onRefreshDetail(record);
    },



    /**
     * Ext run this function while apply record to form
     * We must create detail grid here and filter if using record master field(s)
     * @param {Ext.data.Model} record
     */
//    setValue: function(record) {
//        var
//            me = this, cmdConfig, cmpInitConfig,
//            cmdParams;
//
//
//        cmpInitConfig = Ext.clone(this.cmpInitConfig || {});
//        cmpInitConfig.readOnly = me.readOnly;
//        cmdConfig = {
//            /**
//             * @cfg  {String} [cmdType="showList"] Type of command to execute. One of {@link UB.core.UBCommand#commandType UB.core.UBCommand.commandType}
//             */
//            cmdType: this.cmdType || UB.core.UBCommand.commandType.showList,
//            /**
//             * @cfg {String} entity Entity on which detail grid based on
//             */
//            entity: this.entity,
//            /**
//             * @cfg {Object} cmdData Command data passed to underline grid store
//             */
//            cmdData: this.cmdData,
//            /**
//             * @cfg {String} [cmdCode]
//             * @deprecated
//             */
//            cmdCode: this.cmdCode,
//            /**
//             * @cfg {String} [scriptCode]
//             * @deprecated
//             */
//            scriptCode: this.scriptCode,
//            /**
//             * @cfg {Boolean} [hideHeaders=false] Hide grid headers.
//             */
//            hideHeaders: this.hideHeaders || false,
//            createOnly: true,
//            scope: this,
//            customActions: this.customActions,
//            callback: this.onGridCreate,
//            cmpInitConfig: cmpInitConfig,
//            focusOnUpdate: this.focusOnUpdate
//        };
//        cmdParams = cmdConfig.cmdData && cmdConfig.cmdData.params ? cmdConfig.cmdData.params[0] : null;
//        if(this.masterFields && this.detailFields && cmdParams){
//            cmdConfig.parentContext = {};
//            _.forEach(this.masterFields, function(masterField, index){
//                cmdConfig.parentContext[me.detailFields[index]] = record.get(masterField);
//            }, me);
//
//            cmdParams.whereList = UB.core.UBCommand.addMasterDetailRelation(cmdParams.whereList, this.masterFields, this.detailFields, record);
//            //cmdParams.detailFields = me.detailFields;
//        }
//        if(this.columns){
//            cmdConfig.columns = this.columns;
//        }
//        if(this.items && this.items.length > 0){
//            this.removeAll();
//        }
//        UB.core.UBApp.doCommand(cmdConfig);
//    },



    /**
     * 
     * @param {Ext.data.Model} record
     */
    onRefreshDetail: function(record) {
        var
            me = this, req;

        if (record && record.isModel){
             req = me.store.ubRequest;
             req.whereList = UB.core.UBCommand.addMasterDetailRelation(
                 req.whereList, this.masterFields, this.detailFields, record);
            if (me.rendered){
               me.store.reload();
            }
        }
    }


});