// User: banyai Date: 20.09.13
/* global cdn_profession ubs_numcounter */
// eslint-disable-next-line camelcase
const me = cdn_profession
me.on('insert:before', generateAutoIncrementalCode)

function generateAutoIncrementalCode (ctx) {
  ubs_numcounter.generateAutoIncrementalCode(ctx, 'code')
}
