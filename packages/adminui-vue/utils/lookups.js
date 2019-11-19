const UB = require('@unitybase/ub-pub')

const Lookups = {
  lookups: {},
  enums: new Map(),

  /**
   * Load lookup entity.
   *
   * @param {string} entity Entity name
   * @param {string} [associatedAttr='ID'] Associated attribute code
   * @return {Promise<void>}
   */
  async load (entity, associatedAttr = 'ID') {
    const lookup = this.lookups[entity]
    if (!lookup) {
      this.lookups[entity] = new Map()
      const descriptionAttribute = UB.connection.domain.get(entity).descriptionAttribute
      const { resultData } = await UB.Repository(entity)
        .attrs(associatedAttr, descriptionAttribute)
        .selectAsArray()

      for (const [key, value] of resultData.data) {
        this.lookups[entity].set(key, value)
      }
    }
  },

  /**
   * Load enum entity.
   * Now loaded automatically from root of package adminui-vue.
   *
   * @return {Promise<void>}
   */
  async loadEnum () {
    const enums = await UB.Repository('ubm_enum')
      .attrs('code', 'eGroup', 'name')
      .orderBy('eGroup')
      .select()

    for (const item of enums) {
      const eGroup = this.enums.get(item.eGroup)
      if (eGroup) {
        eGroup.set(item.code, item.name)
      } else {
        this.enums.set(item.eGroup, new Map([[item.code, item.name]]))
      }
    }
  },

  /**
   * Get's enum value
   *
   * @param {string} eGroup Enum group name
   * @param {string} code Code
   * @return {string} Enum value
   */
  getEnumValue (eGroup, code) {
    const groupMap = this.enums.get(eGroup)
    if (groupMap) {
      const value = groupMap.get(code)
      if (value) {
        return value
      } else {
        console.error(`Undefined code '${code}' in eGroup '${eGroup}'`)
      }
    } else {
      console.error(`Undefined eGroup '${eGroup}'`)
    }
  },

  /**
   * Get's value by ID.
   * Entity must be loaded before calling this method.
   *
   * @param {string} entity Entity name
   * @param {number} id Record ID
   * @return {*}
   */
  getValueById (entity, id) {
    if (this.lookups[entity]) {
      return this.lookups[entity].get(id)
    } else {
      return id
    }
  }
}

/**
 * Module contains Map's for lookup entities.
 * Enum has a similar structure but split by eGruop
 *
 * @example
 * Lookups.load('uba_user')
 *
 * Then we get get any value
 *
 * Lookups.getValueById('uba_user', 51734127848)
 */
module.exports = Lookups
