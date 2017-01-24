require('../../../../ux/form/DateTimeField')
/**
 * UnityBase ext-based DateTime picker
 */
Ext.define('UB.ux.form.field.UBDateTime', {
    extend: 'Ext.ux.form.DateTimeField',
    alias: 'widget.ubdatetimefield',
    minWidth: 160,
    constructor: function(config) {
        var me = this;

        config = config || {};
        if (!config.width){
            config.width = ((config.fieldLabel) ? config.labelWidth || me.labelWidth || 100 : 0)   + 160;
        }
        if (config.fieldLabel){
            me.minWidth = config.width;
        }
        me.maxWidth = config.maxWidth || config.width;
        me.callParent([config]);
    }

});