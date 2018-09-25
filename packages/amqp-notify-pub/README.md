# @unitybase/amqp-notify-pub

This package provides a client part of server-to-client notification implementation using stomp compatible message broker (verified with RabbitMQ only)
It's a complementary part of @unitybase/amqp-notify server-side package

## Setup

```
npm install @unitybase/amqp-notify-pub
```

## Configuration

An `amqpNotificationUrl` option of `uiSettings/adminUI` section in application config (`ubConfig.json`) hould be specified.
This provides a URL compatible with web-stomp RabbitMQ plugin and should look like ```ws://127.0.0.1:15674/ws```
The special value '*' could be also provided which means to connect to the same host and port as browser does,
 to /ws route and by ws or wss protocol depending on http or https was used by browser. So if browser connects to http://localhost:8881,
 the url to connect to message brocker will be ws://localhost:8881/ws, or wss://somehost.com/ws for https://somehost.com.
 This is particularly usefull for configurations with nginx involved. Here is a corresponding nginx config file fragment:

``` config
http {
    # ....

    # This is intended to forward websocket connection to actual host and port
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }
    upstream websocket {
        server rabbitmq-server:15674;
    }
    # end of forwarding fragment

    server {
        listen 80 default_server;

        location = / {
            # .....
        }

        # This will listen on /ws route and proxify to external connection
        location /ws {
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
        }
        # end of listening fragment
    }
}
```

The implementation uses UnityBase users to connect to server, so it requires the server part to be configured as described in @unitybase/amqp-notify package

Plase don't forget to create 'ub-amqp-notify' topic exchange before use!

## Examples

Look at the apps/notify-example sample application for complete notification example
