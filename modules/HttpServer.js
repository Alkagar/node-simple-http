var http = require('http');

// var mixinLogger = require('../mixins/Logger.js');
// var mixinRedis = require('../mixins/Redis.js');


module.exports = function(setup) {
    'use strict';

    var obj = {};
    setup = setup || {};
    setup.name = setup.name || 'Unnamed HTTP Server';
    obj.name = setup.name;
    obj.logger = {
        info: function() {
            console.log(arguments);
        },
        trace: function() {
            console.log(arguments);
        },
        debug: function() {
            console.log(arguments);
        }
    };

    var server = null;
    var port = setup.port || 7000;
    var host = setup.host || '0.0.0.0';

    setup.routes = setup.routes || {};

    // private methods

    function addRoutes(routes) {
        for (var i in routes) {
            if (routes.hasOwnProperty(i)) {
                setup.routes[i] = routes[i];
            }
        }
    }

    function writeResponse(response, status, content) {
        response.writeHead(status, {
            'Content-Type': 'text/html'
        });
        response.write(content);
    }

    function defaultRouter(request, response) {
        var url = request.url;
        var urlFunction = url.split('?')[0].replace(/[^a-z0-9-]/gi, '');
        var method = request.method.toLowerCase();
        console.log('--', urlFunction);
        var handlerName = method + urlFunction.charAt(0).toUpperCase() + urlFunction.slice(1).split('?')[0];

        obj.logger.trace({
            'route': url,
            'handler': handlerName,
            'method': method.toUpperCase(),
            'ip': request.headers['X-Forwarded-For']
        });

        if (typeof setup.routes[handlerName] === 'function') {
            setup.routes[handlerName](request, response);
        } else {
            writeResponse(response, 404, 'Default Router. This request is not supported yet. Please contact administrator.');
            response.end();
        }
    }

    function createServer(callback) {
        if (server !== null) {
            return;
        }
        server = http.createServer(defaultRouter);
        server.listen({
            'port': port,
            'host': host
        }, function() {
            obj.logger.info({
                message: 'Server start listening.',
                host: host,
                port: port
            });
            if (typeof callback === 'function') {
                callback();
            }
        });
    }

    createServer();

    obj.logger.info({
        message: 'Server initialized.',
        name: setup.name
    });

    obj.writeResponse = writeResponse;
    obj.addRoutes = addRoutes;
    return obj;

};
