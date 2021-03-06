const App = require('../../modules/App')

App.on('addConnectionToRequest', (name, tenantID) => {
  if (tenantID) {
    const db = App.dbConnections['main']
    if (name === 'main' && db.config.dialect === 'PostgreSQL') {
      db.run('SELECT set_config(\'ub.tenantID\', :tenantID:, false)', { tenantID })
    }
  }
})

module.exports = {}