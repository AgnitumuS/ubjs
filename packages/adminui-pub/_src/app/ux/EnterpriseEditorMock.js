/**
 * UB.ux.EnterpriseEditorMock.js - the mock for a document editors, 
 * available only in UnityBase Enterprise Edition
 */
Ext.define('UB.ux.EnterpriseEditorMock', {
    extend: 'Ext.Panel',
    alias: 'widget.enterpriseeditormock',
    width: '100%',
    height: '100%',
    layout: 'fit',
    html: '<h1>Editor for this document type available only in UnityBase Enterprise edition</h1>',

    /**
     * Fake serSrc
     */
    setSrc: function() {
        return Q.resolve(true);
    }
});
