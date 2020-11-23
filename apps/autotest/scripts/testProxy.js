const http = require('http')

http.setGlobalProxyConfiguration('proxy', 'bypass')

const sevRequestMethodName = '/'

  const request = http.request({
    URL: 'http://sev.dir.gov.ua:4435/csp/dirbus/bus.esb.IntegrationService.cls', // Тестовый сервер - http://213.156.91.113:8082/csp/dirbus/bus.esb.IntegrationService.cls
    method: 'POST',
    sendTimeout: 30000,
    receiveTimeout: 30000,
    connectTimeout: 30000,
    keepAlive: false,
    compressionEnable: false
  })
  request.setHeader('Content-Type', 'text/xml')
  request.setHeader('charset', 'utf-8')
  request.setHeader('SOAPAction', 'http://tempuri.org/ICoverIntegrationService/' + sevRequestMethodName)
  request.write('')

  const response = request.end()

//const resp = http.get('http://sev.dir.gov.ua:4435/csp/dirbus/bus.esb.IntegrationService.cls')

console.log(response.statusCode)
console.log(response.read())