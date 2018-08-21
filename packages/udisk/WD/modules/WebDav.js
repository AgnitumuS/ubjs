/**
 * Implementation of WebDav in UB.
 *
 * Usage sample:
 *
 *      var dav = require('models/WD/modules/webDav.js');
 *      dav.registerProvider(rootName, provider);
 *
 */
/*globals module, require, App, global*/
/*jshint -W089 */
var xmldom = require('xmldom'),
    DOMParser = new xmldom.DOMParser(),
    rootNode = {},
    reDepth = /^Depth: (.*)$/mi,
    reLockToken = /^Lock-Token: <(.*)>$/mi,
    reIfConditions = /^(If:.*)$/mi,
    reDestination = /^Destination: https:\/\/(.*)$/mi,
    reContentLength = /Content-Length: (.*)$/mi,
    reOverwrite = /Overwrite: (.*)$/mi,

    depth, doc, contentLength, overwrite, destination, ifConditions,
    provider, path;

function getIfConditions(header){
    var conditions = [];
    header.replace(/(?:<(.*?)>\s)?\((Not\s)?(?:<([^>]*)>)?(?:\s?)(?:\[([^\]]*)\])?\)/gi,
        function(m, uri, not, token, etag) {
            var tokenLocal = {
                not: !!not,
                token: token,
                etag: etag ? etag : null
            };
            var condition = {
                uri    : uri,
                tokens : [tokenLocal] //token
            };

            if (!condition.uri && conditions.length) {
                conditions[conditions.length - 1].tokens.push(tokenLocal);
            } else {
                conditions.push(condition);
            }
        });

    return conditions;
}

var
    HTML_SUCCESS = 200,
    HTML_CREATED = 201,
    HTML_NOCONTENT = 204,
    HTML_BADREQUEST = 400,
    HTML_UNAUTHORIZED = 401,
    HTML_NOTFOUND = 404,
    HTML_NOTALLOWED = 405,
    HTML_CONFLICT = 409,
    HTML_PRECONDITIONFAILED = 412,
    HTML_UNSUPPORTEDMEDIATYPE = 415,
    HTML_LOCKED = 423;

function writeNoBody(resp, status){
    resp.statusCode = status;
    resp.writeEnd('');
}

function beforeDAVMethod(req, resp, options) {
    var authRes;
    // get provider
    if (req.url === '') {
        path = [];
        provider = rootProvider;
    } else {
        path = decodeURI(req.url).split('/');
        //todo why toLowerCase?
        provider = rootNode[path[0].toLowerCase()];

        path = path.slice(1);
        if (!path[path.length - 1]) {
            path.splice(path.length - 1, 1);
        }
    }
    if (!provider) {
        return false;
    }
    if (options){
        options.provider = provider;
    }
    console.debug('     ');
    console.debug(req.method);
    console.debug(req.headers);
    console.debug('     ');
    // autorize
    authRes = App.authFromRequest();
    console.debug((authRes ? 'Autorized': '------------ ') + '***************************');
    if ((req.method !== 'HEAD') && !authRes){
        writeNoBody(resp, HTML_UNAUTHORIZED);
        return false;
    }

    // prepare for handle request
    provider.setPath(path);

    // get overwrite flag from header
    if (reOverwrite.test(req.headers)) {
        overwrite = reOverwrite.exec(req.headers)[1] === 'T';
    } else {
        overwrite = false;
    }

    // get depth info from header
    if (reDepth.test(req.headers)) {
        depth = reDepth.exec(req.headers)[1];
    } else {
        depth = null;
    }

    // get content length and request body as XML
    if (reContentLength.test(req.headers)) {
        contentLength = reContentLength.exec(req.headers)[1] - 0;
    } else {
        contentLength = 0;
    }

    if ( (contentLength > 0) && ( (req.method ==='PROPFIND') || (req.method === 'PROPPATCH') || (req.method === 'LOCK') ) ) {
        var body = req.read();
        if (body) {
            doc = DOMParser.parseFromString(body);
        } else {
            doc = null;
        }
    } else {
        doc = null;
    }

    // get destination info from header
    if (reDestination.test(req.headers)) {
        destination = decodeURI(reDestination.exec(req.headers)[1]).split('/').slice(2);
    } else {
        destination = null;
    }

    // get and check preconditions
    if (reIfConditions.test(req.headers)) {
        ifConditions = getIfConditions(reIfConditions.exec(req.headers)[1]);
        if (!ifConditions.length) {
            ifConditions = null;
        }
    } else {
        ifConditions = null;
    }

    if (!ifConditions) {
        if (
               (
                   (
                       (req.method === 'PROPPATCH') ||
                       (req.method === 'PUT') ||
                       (req.method === 'DELETE') ||
                       (req.method === 'LOCK') ||
                       (req.method === 'MOVE')
                   ) && provider.getLock().token
               ) ||
               (
                   (
                       (req.method === 'COPY') ||
                       (req.method==='MOVE')
                   ) && provider.getLock(destination).token
               )
           ) {
                writeNoBody(resp, HTML_LOCKED);
                return false;
             }
    } else {
        if (ifConditions.length !== 1) {
            throw new Error('ifConditions.length !== 1');
        }
        var error = null,
            uri = ifConditions[0].uri ? ifConditions[0].uri.split('/').slice(4) : null;

        ifConditions[0].tokens.forEach(function(tok){
            var lock = provider.getLock(uri);
            if (lock.token) {
                if (lock.token == tok.token ? tok.not : !tok.not) {
                    if (ifConditions[0].tokens[0].etag) {
                        error = HTML_PRECONDITIONFAILED;
                    } else {
                        error = HTML_LOCKED;
                    }
                }
                if ( ifConditions[0].tokens[0].etag && (ifConditions[0].tokens[0].etag !== provider.properties['DAV:'].getetag(uri)) ) {
                    error = HTML_PRECONDITIONFAILED;
                }
            } else {
                error = HTML_PRECONDITIONFAILED;
            }
        });
        if (error) {
            writeNoBody(resp, error);
            return false;
        }
    }
    return true;
}

function writeSimpleResponceForMultistatus(resp, el, nsAlias) {
    var
        status, ns, name, nsAl, prop;
    resp.write('<D:response>');
    resp.write('<D:href>');

    //todo optimize
    resp.write( '/' + ( provider.name ? provider.name + '/' : '' ) + el.href.join('/') );
    if ( provider.name && el.props['DAV:'] && el.props['DAV:'].resourcetype &&
         (String(el.props['DAV:'].resourcetype.value).indexOf('collection') >= 0)
       ) {
        resp.write('/');
    }
    resp.write('</D:href>');

    for (status in el.props) {
        resp.write('<D:propstat>');
        resp.write('<D:status>HTTP/1.1 ' + status + '</D:status>');
        resp.write('<D:prop>');

        for (ns in el.props[status]) {
            nsAl = nsAlias[ns];
            for (name in el.props[status][ns]) {
                prop = el.props[status][ns][name];
                if (prop.value || (prop.value === "")) {
                    //nsAlias
                    resp.write('<');
                    if (ns) {
                        resp.write(nsAl);
                        resp.write(':');
                    }
                    resp.write(name);
                    if (!ns) {
                        resp.write(' xmlns=""');
                    }
                    if (prop.value) {
                        resp.write('>');
                        resp.write(prop.value);
                        resp.write('</');
                        if (ns) {
                            resp.write(nsAl);
                            resp.write(':');
                        }
                        resp.write(name);
                    } else {
                        resp.write(' /');
                    }
                    resp.write('>');
                }
            }
        }

        if ( (status == '200 OK') && provider.getLock ) {
            var lockObj = provider.getLock(el.href);
            if (lockObj && lockObj.token) {
                writeLockdiscovery(resp, lockObj);
            } else {
                resp.write('<D:lockdiscovery />');
            }
        }

        resp.write('</D:prop>');
        resp.write('</D:propstat>');
    }

    resp.write('</D:response>');
}

function getNsAlias(arr) {
    var status, ns,
        nsAlias = {
            'DAV:':'D'
        },
        curNsIndex = 0,
        maxNsIndex = 'Z'.charCodeAt(0) - 'D'.charCodeAt(0);

    arr.forEach( function(el){
        for (status in el.props) {
            for (ns in el.props[status]) {
                if (!nsAlias[ns]) {
                    if (curNsIndex < maxNsIndex) {
                        nsAlias[ns] = String.fromCharCode('D'.charCodeAt(0) + (++curNsIndex));
                    } else {
                        throw new Error('too mach namespaces');
                    }
                }
            }
        }
    });
    return nsAlias;
}

function writeMultistatus(resp, arr) {
    var ns, nsAlias = getNsAlias(arr);
    resp.statusCode = 207;
    resp.writeHead('Content-Type: text/xml; charset=utf-8');
    //resp.writeHead(' ;Content-length: 2800');
    resp.write('<?xml version="1.0" encoding="utf-8"?>');
    resp.write('<D:multistatus ');
    for (ns in nsAlias) {
        if (ns) {
            resp.write('xmlns:');
            resp.write(nsAlias[ns]);
            resp.write('="');
            resp.write(ns);
            resp.write('" ');
        }
    }
    resp.write('>');
    arr.forEach(function(el){
        writeSimpleResponceForMultistatus(resp, el, nsAlias);
    });
    resp.writeEnd('</D:multistatus>');
}

function writeLockdiscovery(resp, lockObj){
    resp.write('<D:lockdiscovery>');
    if (lockObj) {
        resp.write('<D:activelock>');
        resp.write('<D:locktype><D:');
        resp.write(lockObj.type || 'write');
        resp.write('/></D:locktype>');
        resp.write('<D:lockscope><D:');
        resp.write(lockObj.scope || 'exclusive');
        resp.write('/></D:lockscope>');
        resp.write('<D:depth>');
        resp.write(lockObj.depth || 0);
        resp.write('</D:depth>');
        resp.write('<D:owner>');
        resp.write(lockObj.owner);
        resp.write('</D:owner>');
        resp.write('<D:timeout>Second-');
        resp.write(lockObj.timeout || 50);
        resp.write('</D:timeout>');
        resp.write('<D:locktoken><D:href>');
        resp.write(lockObj.token);
        resp.write('</D:href></D:locktoken>');
        resp.write('</D:activelock>');
    }
    resp.write('</D:lockdiscovery>');
}

function writeLockProp(resp, lockObj){
    resp.statusCode = 200;

    resp.writeHead('Content-Type: text/xml; charset=utf-8');
    if (lockObj) {
        resp.writeHead('Lock-Token: <' + lockObj.token + '>');
    }
    resp.write('<?xml version="1.0" encoding="utf-8"?>');
    resp.write('<D:prop xmlns:D="DAV:" >');
    writeLockdiscovery(resp, lockObj);
    resp.writeEnd('</D:prop>');
}

var
    rootProvider = {
        setPath: function(path){
        },
        getItems: function() {
            var elem, arr = [];
                for (elem in rootNode) {
                    arr.push(elem);
                }
            return arr;
        },
        allProperties: {
            'DAV:': {
                'getlastmodified' : {},
                'creationdate': {},
                'getcontentlength': {},
                'getcontenttype': {},
                'resourcetype': {},
                'getetag': {}
            }
        },
        properties: {
            "DAV:": {
                resourcetype: function(){
                    return '<D:collection />';
                }
            },
            getPropValue: function(prop){
                return null;
            }
        }

    };

var
    controller = {
        PROPFIND: function(req, resp) {
            // todo xmax  PROPFIND with depth=1
            if (provider.exists && !provider.exists()) {
                return;
            }
            var reqProps = {},
                items;
            if (doc) {
                var i,
                    propfind = doc.getElementsByTagNameNS('DAV:','propfind'),
                    props = (propfind.$$length > 0) ? propfind[0].getElementsByTagNameNS('DAV:','prop')[0].childNodes : null;
                if (!props) {
                    writeNoBody(resp, HTML_BADREQUEST);
                    return;
                }
                for (i = 0; i<props.length; i++ ) {
                    if (props[i].localName) {
                        if (!props[i].namespaceURI&&!provider.properties.getPropValue('', '', props[i].localName)){
                            writeNoBody(resp, HTML_BADREQUEST);
                            return;
                        }
                        if (!reqProps[props[i].namespaceURI]) {
                            reqProps[props[i].namespaceURI] = {};
                        }
                        if (!reqProps[props[i].namespaceURI][props[i].localName]) {
                            reqProps[props[i].namespaceURI][props[i].localName] = {};
                        }
                    }

                }
            } else {// body is empty - default props
                if (contentLength) {//invalid request - not empty and not xml
                    writeNoBody(resp, HTML_BADREQUEST);
                    return;
                }
                reqProps = provider.allProperties || rootProvider.allProperties;
            }

            if (depth === 1) {
                items = ( (provider === rootProvider) ? [] : [''] ).concat(provider.getItems());
            }
            else {
                items = [''];
            }

            items = items.map(function(item){
                var ns, name, nsProp,
                    curPath = item ? path.concat(item) : path,
                    curReqProps = provider.properties.getAllPropsList && (!doc) ?
                        provider.properties.getAllPropsList(item, _.clone(reqProps, true)) : _.clone(reqProps, true),
                    curProps = {},
                    curStatus,
                    curValue;

                for (ns in curReqProps) {
                    for (name in curReqProps[ns]) {
                        nsProp = provider.properties[ns];
                        curValue = nsProp && nsProp[name] ?
                            nsProp[name](item) : provider.properties.getPropValue(item, ns, name);

                        if (curValue === undefined) {
                            curStatus = '404 Not Found';
                            curValue = '';
                        } else {
                            curStatus = '200 OK';
                        }

                        if (!curProps[curStatus]) {
                            curProps[curStatus] = {};
                        }
                        if (!curProps[curStatus][ns]) {
                            curProps[curStatus][ns] = {};
                        }
                        if (!curProps[curStatus][ns][name]) {
                            curProps[curStatus][ns][name] = {};
                        }

                        curProps[curStatus][ns][name].value = curValue;
                    }
                }
                return {
                    href: curPath,
                    props: curProps
                };
            });
            writeMultistatus(resp, items);
        },
        GET: function(req, resp) {
            provider.doGet(resp);
            resp.statusCode = HTML_SUCCESS;
        },
        LOCK: function(req, resp){
            var lockObj;
            if (doc) {

                var lockinfo = doc.getElementsByTagNameNS('DAV:', 'lockinfo')[0],
                    lockscope = lockinfo.getElementsByTagNameNS('DAV:', 'lockscope')[0],
                    locktype = lockinfo.getElementsByTagNameNS('DAV:', 'locktype')[0],
                    owner = lockinfo.getElementsByTagNameNS('DAV:', 'owner')[0];
                if (lockscope.childNodes[0].localName === 'shared') {
                    lockObj = null; //shared locks is not supported yet
                } else {
                    lockObj = provider.doLock({
                        scope: lockscope.childNodes[0].localName,
                        type: locktype.childNodes[0].localName,
                        owner: owner.childNodes[0].nodeValue
                    });
                }
                //todo timeout
            } else {
                if (ifConditions && ifConditions.length === 1) {
                    lockObj = provider.getLock();
                    lockObj = (lockObj.token === ifConditions[0].tokens[0].token ? lockObj : null);
                } else {
                    lockObj = provider.doLock({
                        scope: 'exclusive',
                        type: 'write',
                        owner: 'owner'
                    });
                    //todo timeout
                }
            }
            writeLockProp(resp, lockObj);
        },
        UNLOCK: function(req, resp){
            var token;
            if (reLockToken.test(req.headers)) {
                token = reLockToken.exec(req.headers)[1];
            }else {
                token = null;
            }
            if (provider.doUnLock(token)) {
                writeNoBody(resp, HTML_NOCONTENT);
            } else {
                writeNoBody(resp, HTML_BADREQUEST);
            }
        },
        PUT: function(req, resp){
            if (provider.doPut(req)) {
                writeNoBody(resp, HTML_CREATED);
            } else {
                writeNoBody(resp, HTML_CREATED);// todo why always HTML_CREATED
            }
        },
        PROPPATCH: function(req, resp) {
            var puI, puItem,
                poI, poItem, poOperation,
                prI, prItem,
                ns, name, value,
                status = '200 OK',
                setProps = {},
                propertyupdate;
            if (doc) {
                propertyupdate =
                        (doc.documentElement.localName === 'propertyupdate' && doc.documentElement.namespaceURI === 'DAV:') ? doc.documentElement : null;
                if (propertyupdate) {
                    setProps[status] = {};
                    for ( puI = 0; puI < propertyupdate.childNodes.length; puI++ ) {
                        puItem = propertyupdate.childNodes[puI];
                        if (puItem.localName) {
                            if ( (puItem.localName === 'set' || puItem.localName==='remove') && puItem.namespaceURI==='DAV:' ) {
                                if (puItem.localName === 'set') {
                                    poOperation = provider.properties.setPropValue;
                                } else if (puItem.localName === 'remove') {
                                    poOperation = provider.properties.delProp;
                                }
                                for ( poI = 0; poI < puItem.childNodes.length; poI++ ) {
                                    poItem = puItem.childNodes[poI];
                                    if (poItem.localName) {
                                        if ( poItem.localName === 'prop' && poItem.namespaceURI === 'DAV:' ) {
                                            for ( prI = 0; prI < poItem.childNodes.length; prI++ ) {
                                                prItem = poItem.childNodes[prI];
                                                if (prItem.localName) {
                                                    ns = prItem.namespaceURI;
                                                    name = prItem.localName;
                                                    value = prItem.childNodes.length > 0 ? prItem.childNodes[0].data : null;
                                                    poOperation(ns, name, value);
                                                    if (!setProps[status][ns]) {
                                                        setProps[status][ns] = {};
                                                    }
                                                    if (!setProps[status][ns][name]) {
                                                        setProps[status][ns][name] = {};
                                                    }
                                                    setProps[status][ns][name].value = "";
                                                }
                                            }
                                        } else {
                                            throw new Error(poItem.namespaceURI + '.' + poItem.localName);
                                        }
                                    }
                                }
                            } else {
                                throw new Error(puItem.namespaceURI + '.' + puItem.localName);
                            }
                        }
                    }
                } else {
                    throw new Error('no propertyupdate found');
                }
            }
            writeMultistatus(resp, [{href: path, props: setProps}]);
        },
        MOVE: function(req, resp) {
            var res = provider.doMove(destination, overwrite);
            if (res) {
                writeNoBody(resp, HTML_CREATED); //The resource was successfully copied.
            } else if (res === null){
                writeNoBody(resp, HTML_NOCONTENT); //The source resource was successfully copied to a pre-existing destination resource.
            } else if (res === undefined) {
                writeNoBody(resp, HTML_CONFLICT); //A resource cannot be created at the destination URI until one or more intermediate collections are created.
            } else {
                writeNoBody(resp, HTML_PRECONDITIONFAILED); //Either the Overwrite header is "F" and the state of the destination resource is not null, or the method was used in a Depth: 0 transaction.
            }
        },
        COPY: function(req, resp) {

            var res = provider.doCopy(destination, overwrite);
            if (res) {
                writeNoBody(resp, HTML_CREATED); //The resource was successfully copied.
            } else if (res === null) {
                writeNoBody(resp, HTML_NOCONTENT); //The source resource was successfully copied to a pre-existing destination resource.
            } else if (res === undefined) {
                writeNoBody(resp, HTML_CONFLICT); //A resource cannot be created at the destination URI until one or more intermediate collections are created.
            } else {
                writeNoBody(resp, HTML_PRECONDITIONFAILED); //Either the Overwrite header is "F" and the state of the destination resource is not null, or the method was used in a Depth: 0 transaction.
            }
        },
        DELETE: function(req, resp) {
            if (provider.doDelete()) {
                writeNoBody(resp, HTML_NOCONTENT);
            } else {
                writeNoBody(resp, HTML_NOTFOUND);
            }
        },
        MKCOL: function(req, resp) {
            if (contentLength) {
                writeNoBody(resp, HTML_UNSUPPORTEDMEDIATYPE);
                return;
            }
            try {
                if (provider.doCreateDir()) {
                    writeNoBody(resp, HTML_CREATED);
                } else {
                    writeNoBody(resp, HTML_NOTALLOWED);
                }
            } catch(err) {
                writeNoBody(resp, HTML_CONFLICT);
            }
        },
        HEAD: function(req, resp) {
            var davProp = provider.properties['DAV:'],
                contentLength = 0, etag, contentType, lastModified;
            if ((contentLength = provider.getContentLength())===null) {
                if (davProp && davProp.getcontentlength) {
                    contentLength = davProp.getcontentlength();
                }
            }
            resp.writeHead('Content-Length: ' + (contentLength-0));
            if (davProp) {
                if (davProp.getetag && (etag = davProp.getetag())) {
                    resp.writeHead('ETag: ' + etag);
                }
                if (davProp.getcontenttype && (contentType = davProp.getcontenttype())) {
                    resp.writeHead('Content-Type: ' + contentType);
                }
                if (davProp.getlastmodified && (lastModified = davProp.getlastmodified())) {
                    resp.writeHead('Last-Modified: ' + lastModified);
                }
            }

            writeNoBody(resp, HTML_SUCCESS);
        }
    };

/*
 * handle webDav request
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
module.exports = function(req, resp){
    var result, options = {};
    resp.statusCode = HTML_NOTFOUND;

    try {
        if (beforeDAVMethod(req, resp, options)) {
            resp.statusCode = HTML_NOTFOUND;// may be changed when auth
            if (controller[req.method]) {
                result = controller[req.method](req, resp);
            } else {
                throw new Error('Unknown method');
            }
        }
    } finally {
        if (options && options.provider && options.provider.finalize){
            options.provider.finalize(req, resp, options);
        }
    }
    return result;
};
/**
 * @class WebDaw
 * Register custom provider. See Guide for details
 * @param {String} name
 * @param {Object} provider
 */
module.exports.registerProvider = function(name, provider) {
    if (rootNode.name) {
        throw new Error('Provider already registered');
    }

    provider.name = name;
    rootNode[name.toLowerCase()] = provider;
    App.registerEndpoint(name, module.exports, false);
};

App.registerEndpoint('dav', module.exports, false);
/*jshint +W089 */