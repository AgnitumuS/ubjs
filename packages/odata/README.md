# OData(v4) provider for UnityBase

After call to OData.registerEndpoint UB enityties are accessible using OData protocol.

         var OData = require('@ub-e/odata');

         var endpoint = OData.registerEndpoint({
            endpointName: 'ODataV4',
            namespace: 'autotest',
            requireAuth: false,
            skipOptimisticLock: true,
            entitySetMapping: {
                ODataRef: App.domain.byName('tst_ODataRef'),
                ODataSimple: App.domain.byName('tst_ODataSimple')
            }
         });

We strongly recommend to use a `ubql` because it is easier, more convenient and faster than the `OData`