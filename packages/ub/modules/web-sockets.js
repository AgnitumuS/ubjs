/**
 * HI-level WebSocket protocols implementation
 *
 * @module @unitybase/ub/web-sockets
 * @author pavel.mash
 */
var
    registeredWSProtocols = {},
    EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 * @classdesc
 *  Internal Server-side WebSocket transport layer. Will communicate with clients using low-level binding classes.
 *  Usually you do not need to use this class directly, better to use a instance of {@link JsonMessagesProtocol} from {@link UB.wsNotifier}
 *
 *  Server emmit three type of event on the protocol level:
 *
 *   - `connect`, parameters are: ({WebSocketConnection} wsConn)
 *   - `disconnect`, parameters are: ({WebSocketConnection} wsConn, {String} closeReason, {Number} closeStatus) http://tools.ietf.org/html/rfc6455#section-7.4
 *   - `message`, parameters are: ({WebSocketConnection} wsConn, {String|ArrayBudder} message)
 *
 * @param {Object} props
 * @param {String} props.name
 * @param {String} props.handledAs
 * @class WebSocketTransport
 * @protected
 * @extends EventEmitter
 */
function WebSocketTransport(props){
    var wsProtocol,
        wsBinding = process.binding('ub_ws'),
        protocolIndex;

    if (registeredWSProtocols.hasOwnProperty(props.name)){
        wsProtocol = registeredWSProtocols[props.name];
    } else {
        if (process.isWebSocketServer) {
            wsProtocol = wsBinding.addProtocol(props);
            EventEmitter.call(wsProtocol);
            util._extend(wsProtocol, EventEmitter.prototype);
            registeredWSProtocols[props.name] = wsProtocol;
        } else {
            wsProtocol = wsBinding.retrieveProtocol(props);
            registeredWSProtocols[props.name] = wsProtocol; // memorize null in case WS not supported
        }
        if (wsProtocol) {
            protocolIndex = wsProtocol.index;
            /**
             * Returns the IDs of all the sessions with established WebSocket connections
             * @memberOf WebSocketTransport
             * @param {Number} userID uba_user identifier
             * @return {Array<Number>}
             */
            wsProtocol.getUserSessions = function (userID) {
                return wsBinding.getUserSessions(userID, protocolIndex);
            };
            /**
             * Send a data package to specified session ID.
             * Return true on success, false in case WS connection for specified session is lost or closed/closing
             *
             * @param {Number} sessionID
             * @param {String|Object|ArrayBuffer} data
             * @return {Boolean}
             */
            wsProtocol.sendTo = function (sessionID, data) {
                return wsBinding.send(sessionID, protocolIndex, data);
            };

            /**
             *
             * @param {Number} sessionID
             * @param {String} reason
             */
            wsProtocol.closeSession = function (sessionID, reason) {
                var data = _.isString(reason) ? reason : JSON.stringify(reason);
                wsBinding.close(sessionID, protocolIndex, data);
            };

            /**
             * Send a data package to all protocol sessions.
             *
             * @param {String|Object|ArrayBuffer} data
             */
            wsProtocol.broadcast = function(data){
                wsBinding.broadcast(protocolIndex, data);
            };
        }
    }
    return wsProtocol;
}

/**
 * @classdesc
 * Simple protocol for exchanging JSON commands.
 *
 * Each message transferred by a web socket is a JSON with two attributes
 *
 *      {command: {String}, params: {*}}
 *
 * Inside a WebSocket threads you can subscribe to a messages, arrived from a clients
 * and assign handlers to it (if you need to receive web socket messages in server):

        const WebSockets = require('@unitybase/ub/modules/web-sockets');
        var wsNotifier = WebSockets.getWSNotifier();
            if (wsNotifier) {
                console.debug('Start subscribing to wsNotifier tsts_* events');
                wsNotifier.on('tst_echo', function (connection, params) {
                    connection.send({
                    command: 'tst_message', params: {from: connection.session.userID, message: params}
                });
            });
        }

 * Inside a http threads can be used as such:
 *
        const WebSockets = require('@unitybase/ub/modules/web-sockets');
        function notifyAboutNewRecord(rowID){
            var notifier = WebSockets.getWSNotifier();
            if (notifier) {
                //send message to ALL connected sessions
                notifier.broadcast('ub_entityModification', {action: 'insert', ID: rowID});

                //Send to specific user
                var userSessions = notifier.getUserSessions(Session.userID);
                userSessions.forEach(function(sessionID){
                    notifier.sendCommand('test_command', sessionID, {action: 'inserted', ID: rowID});
                });
            }
        }
 *
 *  If WebSocket support are enabled in server config then instance of this protocol is accessible via {@link UB#wsNotifier UB.wsNotifier}
 *
 * @class JsonMessagesProtocol
 * @param {String} namedAs The name of a resulting protocol
 * @extends EventEmitter
 */
function JsonMessagesProtocol(namedAs){
    var
        me = this;

    var _jsonProtocol = new WebSocketTransport({name: namedAs, handledAs: 'Json'});

    /**
     * Send a specified command to recipient. Return `true` if data has been successfully sent (no guaranty it is received by client)
     * @param {String} command Command to send
     * @param {Number} recipient User Session identifier
     * @param {*} params Any value
     * @return {Boolean}
     */
    this.sendCommand = function(command, recipient, params){
        return _jsonProtocol.sendTo(recipient, {command: command, params: params});
    };

    /**
     * Returns the IDs of all the sessions with established WebSocket connections
     *
     * @param {Number} userID User identifier (from uba_user)
     * @return {Array<Number>}
     */
    this.getUserSessions = function(userID){
        return _jsonProtocol.getUserSessions(userID);
    };

    /**
     * Send a specified command to all user sessions connected using this protocol
     *
     * @param {String} command Command to send
     * @param {*} params Any value
     */
    this.broadcast = function(command, params){
        return _jsonProtocol.broadcast({command: command, params: params});
    };

    if (process.isWebSocketServer) {
        EventEmitter.call(me);
        util._extend(me, EventEmitter.prototype);

        /**
         * Handle incoming messages
         * @protected
         * @param {WebSocketConnection} connection
         * @param {String|ArrayBuffer} rawData
         */
        me.onWSMessage = function (connection, rawData) {
            var msg;

            console.debug('New WebSocket message from ', connection.session.id, rawData);
            try {
                msg = JSON.parse(rawData);
            } catch (err) {
                connection.send({command: 'error', params: {description: 'Invalid params: ' + rawData}});
                return;
            }
            var
                command = msg.command,
                params = msg.params;

            if (!me.emit(command, connection, params)) {
                connection.send({command: 'error', params: {description: 'Invalid command: ' + command}});
            }
        };

        /**
         * @param {WebSocketConnection} connection
         * @protected
         */
        me.onWSConnect = function (connection) {
            console.debug('Web socket connected: ', connection.session.id);
            /**
             * @event connect
             */
            me.emit('connect', connection);
            connection.send({
                command: 'accepted', params: {connectionID: connection.session.id}
            });

        };

        /**
         * @param {WebSocketConnection} connection
         * @param {String} reason
         * @param {Number} status
         * @protected
         */
        me.onWSDisconnect = function (connection, reason, status) {
            console.debug('WS Disconnected ', connection.session.id, 'reason', reason, 'status', status);
            /**
             * @emit disconnect
             */
            me.emit('disconnect', connection, reason, status);
        };

        _jsonProtocol.on('connect', me.onWSConnect);
        _jsonProtocol.on('message', me.onWSMessage);
        _jsonProtocol.on('disconnect', me.onWSDisconnect);
    }
}

/**
 * Return array of currently registered WS protocol names
 * @returns {Array<string>}
 */
function registeredProtocols() {
    var wsBinding = process.binding('ub_ws');
    return wsBinding.getProtocols();
}

var _ubNotifierInstance = process.isWebSocketEnabled ? undefined : null;

/**
 * Return a instance of {@link JsonMessagesProtocol} named `ubNotifier` for Server<->Client communication using WebSocket
 *
 * In case `ubNotifier` protocol is not registered during WebSocket thread initialization
 * or not configured in config - will return `null`
 *
 * Returned {@link JsonMessagesProtocol} instance methods is limited
 * by {@link WSProtocol#getUserSessions}, {@link WSProtocol#sendTo} and {@link WSProtocol#broadcast}
 *
 * See {@tutorial web_sockets.md } for detailed descripiuon
 *
 * @return {JsonMessagesProtocol}
 */
function getWSNotifier(){
    if (_ubNotifierInstance || _ubNotifierInstance===null)
        return _ubNotifierInstance;

    _ubNotifierInstance = new JsonMessagesProtocol('ubNotifier');
    return _ubNotifierInstance;
}

module.exports = {
    protocols: {
        JsonMessages: JsonMessagesProtocol
    },
    Transport: WebSocketTransport,
    registeredProtocols,
    getWSNotifier
};
