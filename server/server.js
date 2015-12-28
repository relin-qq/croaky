"use strict";
//Core-Nodejs Modules
var Http      = require("http");
var Https     = require("https");
var Url       = require("url");
var Fs        = require("fs");

//External Modules
var Extend    = require("extend");
var Director  = require("director");

//Local Modules
var Handler   = require("./js/handler.js");
var ErrorType = require("./js/errortype.js");
var Templates = require("./js/templates.js");
var WebsocketManager = require("./js/wsm.js").WebsocketManager;

var authentication = function(req, onError){
    var path     = Url.parse(req.url).pathname;

    var hash     = req.headers["authorization"];
    var xdate    = req.headers["x-date"];
    var username = req.headers["x-user"];
    var method   = req.method;

    if(!hash || !xdate || !username){
        onError(ErrorType.AUTH_MISSING_FIELDS);
        return null;
    }

    //TODO: check auth here
    if(!auth){
        onError(ErrorType.AUTH_FAILED);
        return null;
    }

    return {
        user  : username,
        date  : xdate,
        method: method,
        path  : path,
        hash  : hash
    };
};

var Routing = function(handler){
    //should be defined in the routing definition... because of reasons.

    var checkAuth = function(){
        var next = arguments[arguments.length - 1];
        next(); 
    };

    //Hack workaround. Directory uses the this scope to work with response and request objects
    var bind = function(func){
        //Director Response Wrapper. Only works with "async" functionality from the Director libary
        var responseHandler = function(){
            var self = this;
            var args = Array.prototype.slice.call(arguments);
            var next = args.pop();

            args.push(function(response, error){
                if(!response && !error)
                    return next();

                if(error)
                    return next(error);


                self.res.writeHead(response.code);
                self.res.end(JSON.stringify(response.msg));
            });

            func.apply(self, args);
        };

        var wrapped = function(){
            responseHandler.apply(this, arguments); 
        };

        return wrapped;
    };

    var check = function(key){
        var wrapped = function(){
            var args = Array.prototype.slice.call(arguments);
            var next = args.pop();

            Templates.check.call(this, key, function(){
                if(template)
                    return next();

                if(error)
                    return next(error);
            }); 
        };

        return wrapped;
    };

    //Non websocket definitions
    var pathDefinitions = {
        "/r/:username":{
            put: bind(handler.createUser)
        },
        "/u/:userName":{
            before: [checkAuth],
            get   : bind(handler.getUser),
            post  : bind(handler.modifyUser),
            "/pm/[\*]":{
                get: bind(handler.getConversationPartnerNames)
            },
            "/pm/:otherUser":{
                get: bind(handler.getPrivateMessages)
            }
        },
        "/g/:groupName":{
            before: [bind(checkAuth)],
            put   : [check("group"), bind(handler.createGroup)],
            "/join/:pass":{
                before: [bind(handler.checkPass)],
                put   : bind(handler.enlist)
            },
            "/manage":{
                before: [bind(handler.checkRole)],
                post  : bind(handler.modifyGroup)
            },
            "/channels/:channel": {
                get   : bind(handler.getChannel),
                post  : bind(handler.modifyChannel),
                put   : bind(handler.createChannel),
                delete: bind(handler.deleteChannel)
            },
            "/channels/[\*]":{
                get: bind(handler.getAllChannel)
            },
            "/users/([\*])" : {
                get: bind(handler.getAllGroupUsers)
            }
        }        
    };
    
    var router = new Director.http.Router(pathDefinitions);
    
    router.configure({
        async  : true,
        strict : false,
        recurse: "forward"
    });

    //Will fire if all the data has been captured, meaning you do not have to concat the json chunks (director feature)
    router.attach(function(){
        this.auth = authentication(this.req);
        this.data = JSON.tryParse(this.req.chunks.join("")) || null;
    });

    return router;
};

JSON.tryParse = function(data){
    try{
        return JSON.parse(data);
    }catch(e){
        return null;
    }
};

var Server = function(config, router){
    var self = this;

    var handleRequest = function(req, res){
        if (req.method == "OPTIONS") {
            res.writeHead(ErrorType.OK.code, config.cors.allowed);
            res.end();
            return;
        }

        req.chunks = [];
        req.on("data", function (chunk) {
            req.chunks.push(chunk.toString());
        });

        req.on("end", function(){
            router.dispatch(req, res, function (error) {
                res.writeHead(error.statusCode);
                res.end(error.msg);
            });
        });
    };

    self.authentication = authentication;
    var nativeServer = null;

    var start = function(){
        try{
            //Trying to start HTTPS-Server
            var sslOptions = {
                key: Fs.readFileSync(config.ssl.key),
                cert: Fs.readFileSync(config.ssl.cert)
            };

            nativeServer = Https.createServer(sslOptions, function (req, res) {
                handleRequest(req, res);
            }).listen(config.https, config.interface);

        }catch(e){
            //HTTP Fallback
            nativeServer = Http.createServer(function (req, res) {
                handleRequest(req, res);
            }).listen(config.http, config.interface);
        }
    };

    self.getNativeServer = function(){
        return nativeServer;
    };

    start();
}

var parseConfig = function(path){
    try {
        var buffer = Fs.readFileSync(path);
        return JSON.parse(buffer.toString("utf8"));
    }
    catch (e) {
        throw "Couldn't parse the config file.";
    }
};

var Config = parseConfig("config.json");

//TODO: use "extend" and check with template

var server = new Server(Config, new Routing(Handler));
var ws = new WebsocketManager(server);
