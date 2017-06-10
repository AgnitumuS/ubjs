App.once('domainIsLoaded', () => {
  console.debug('domainIsLoaded (ONCE)');
  let memDB = App.databases_['inmemory']
  memDB.exec('CREATE TABLE IF NOT EXISTS uba_sessions(ID INTEGER PRIMARY KEY, uData, expired)', {})
});