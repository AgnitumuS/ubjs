/* global org_profession ubs_numcounter */
// eslint-disable-next-line camelcase
const me = org_profession

me.on('insert:before', ubs_numcounter.generateAutoIncrementalCode)
