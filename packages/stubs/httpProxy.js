/**
 * Created by xmax on 26.12.2016.
 */

const http = require('./http.js');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const CRLF = '\r\n';
const url = require('url');
const uba_common = require('models/UBA/modules/uba_common.js')
//var util = require('util')


class HttpProxy{
    /**
     * optional aProxyName may contain the name of the proxy server to use,
     * and aProxyByPass an optional semicolon delimited list of host names or
     * IP addresses, or both, that should not be routed through the proxy
     * @param {Object} config
     * @param {Object} [config.proxy]
     * @param {String} [config.proxyName] ProxyName may contain the name of the proxy server to use,
     * @param {String} [config.proxyByPass] proxyByPass an optional semicolon delimited list of host names or IP addresses, or both, that should not be routed through the proxy
     * @param {Array|String} [config.publicPath] These paths do not require authentication '*' - all
     */
    constructor(config) {
        let me = this;
        this.publicName = config.publicName;

        EventEmitter.call(this);
        _.extend(this, EventEmitter.prototype);

        let params = {
            URL: config.URL,
            host: config.host,
            port: config.port,
            path: config.path,
            keepAlive: true,
            useHTTPS: config.useHTTPS,
            compressionEnable: config.useCompression,
            proxy: config.proxy
        };
        if (config.connectTimeout >= 0){
            params.connectTimeout = config.connectTimeout;
        }
        if (config.receiveTimeout >= 0){
            params.receiveTimeout = config.receiveTimeout;
        }
        if (config.sendTimeout >= 0){
            params.sendTimeout = config.sendTimeout;
        }
/*
        this.proxy = new THTTPClient(this.host, this.port, this.useHTTPS, this.useCompression,
            this.proxy ? this.proxy.proxyName: '',
            this.proxy ? this.proxy.proxyByPass: '', this.connectTimeout, this.sendTimeout, this.receiveTimeout
        );
        _http.keepAlive = options.keepAlive ? 1 : 0;
*/
        //debugger;

        this.publicPath = config.publicPath && (typeof(config.publicPath) === 'string') ?
            (config.publicPath === '*' ? false: [config.publicPath] ) : config.publicPath || [];
        this.initParams = params;
        this.connect = http.request(params);
        if (this.connect.options.path && this.connect.options.path !== '/'){
            this.basePath = this.connect.options.path;
        }
        //this.startUrl = this.connect.options.protocol + '//' + this.connect.options.host

        if (this.publicName) {
            App.registerEndpoint(this.publicName, function (req, resp) {
                me.processRequest(req, resp);
            }, false);
        }
    }


    checkPathAuth(path, resp){
        if (this.publicPath === false) return true; // all public
        var basePath = path || '/',
            basePathLen = basePath.length,
            chkRes;
        if (this.publicPath.length > 0){
            chkRes = this.publicPath.every(function(pathChk){
                let absolutPath = false;
                if (Array.isArray(pathChk)){
                    absolutPath = pathChk[1]
                    pathChk = pathChk[0]
                }
                return !((pathChk.length >= basePathLen) &&
                   (
                      (pathChk === basePath) ||
                      (!absolutPath && (pathChk.substr(0, basePathLen) === basePath))
                   ));
            });
            if (!chkRes) return true;
        }
        if (!App.authFromRequest() || (Session.userID == uba_common.ROLES.ANONYMOUS.ID)){
            resp.statusCode = 401;
            resp.writeEnd('');
            return false;
        }

        return true;
    }

    /**
     * Start proxy request
     * @param {THTTPRequest} req
     * @param {THTTPResponse} resp
     */
    processRequest(req, resp){
        var response = null, hdrs,
            me = this;
        this.connect.setMethod(req.method);

        var rqHeaders = req.headers.split('\r\n');
        /*
        let i = 0
        while (i < rqHeaders.length){

            if (rqHeaders[i] &&
                (
                 (rqHeaders[i].indexOf('If-Range') === 0) ||
                 (rqHeaders[i].indexOf('Range') === 0)
                )){
                rqHeaders.splice(i,1);
                continue;
            }
            i++;
        }*/
        this.connect.setRawHeader(rqHeaders.join('\r\n'));

        function checkResponse(){
            switch(response.statusCode){
                case 301:
                case 302:
                    if (hdrs.location){
                        let parsedURL =  url.parse(hdrs.location);
                        if (parsedURL.protocol === me.connect.options.protocol &&
                            parsedURL.hostName === me.connect.options.hostName &&
                            parsedURL.port === me.connect.options.port){
                            hdrs.location = App.serverURL + '/' + this.publicName + '/' + parsedURL.path + parsedURL.hash;
                        }
                    }
                    break;
            }
        }



        //let path = req.uri.substr(this.publicName.length - 1);
        let path = (me.basePath ? me.basePath: '') + (req.uri || '/') + (req.parameters ? '?' + req.parameters: '');
        if (!me.checkPathAuth(path, resp)){
            return;
        }
        if (path) {
            this.connect.setPath(path);
        }
        try {
            response = me.connect.end(req.read('bin'), 'bin');
        } catch(e) {
            console.error(e.message);
            resp.statusCode = 500;
            resp.writeHead('Content-Type: text/plain');
            //resp.writeHead(this.connect.rawHeaders());
            resp.writeEnd(e.message, 'utf-8');
            return;
        }

        hdrs = response.headers();
        if (checkResponse() === false){
            return;
        }
        resp.statusCode = response.statusCode;
        if (hdrs['content-type']){
            resp.writeHead('Content-Type: ' + hdrs['content-type']);
        }


        resp.writeHead('Content-Type: ' + hdrs['content-type']);
        if (hdrs['cache-control']) resp.writeHead('Cache-Control: ' + hdrs['cache-control']);
        if (hdrs['date']) resp.writeHead('Date: ' + hdrs['date']);
        if (hdrs['etag']) resp.writeHead('ETag: ' + hdrs['etag']);
        if (hdrs['last-modified']) resp.writeHead('Last-Modified: ' + hdrs['last-modified']);
        if (hdrs['last-modified']) resp.writeHead('Last-Modified: ' + hdrs['last-modified']);
/*
        _.forEach(hdrs, function(value, key){
            if (['content-lenth','content-type'].indexOf(key) >= 0) return; //'connection'
            if (!key) return;
            resp.writeHead(key.toUpperCase() +  (value? ': ' + value: ''));
        });
*/
      //resp.writeHead(response.rawHeaders());

        resp.writeEnd(response.read('bin'), 'bin');
    }
}

module.exports = HttpProxy;


