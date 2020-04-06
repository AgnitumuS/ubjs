require('../helpers/install-xhr')
const { entities } = require('../../utils/lookups')
const assert = require('assert')

const lookups = {
  uba_user: {
    132321: {
      value: 'admin',
      id: 132321
    }
  },

  tst_dictionary: {
    code1: {
      value: 'code 1',
      id: 312
    }
  }
}

const reletaions = {
  tst_dictionary: {
    312: 'code1'
  }
}

// lookups.uba_user.132321
// lookups.uba_user.1
// lookups.tst_dictionary.code1
// search by id

const enums = {
  DFX_USER_ACTIONS: {
    INSERT: {
      value: 'Insert',
      id: 213123213
    }
  }
}

// enums.DFX_USER_ACTIONS.INSERT
// enums.DFX_USER_ACTIONS213.INSERT

describe('Lookups', () => {
  describe('#Get lookup value', () => {
    it('', () => {
      assert(entities.tst_dictionary[10] === 'code 10')
    })
  })
})
