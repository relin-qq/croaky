"use strict";
//Core-Nodejs Modules
var Http      = require("http");
var Https     = require("https");
var Url       = require("url");
var Fs        = require("fs");

//External Modules
var Extend    = require("extend");
var Director  = require("director");
var Primus    = require("primus");

//Local Modules
var Handler   = require("./js/handler.js");
var ErrorType = require("./js/errortype.js");

var authentication = function(req){
    var path     = Url.parse(req.url).pathname;

    var hash     = req.headers["authorization"];
    var xdate    = req.headers["x-date"];
    var username = req.headers["x-user"];
    var method   = req.method;

    if(!hash || !xdate || !username)
        return ErrorType.AUTH_MISSING_FIELDS;

    //TODO: check auth here
    if(!auth)
        return ErrorType.AUTH_FAILED;

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
            put   : bind(handler.createGroup),
            "/join/:pass":{
                before: [bind(handler.checkPass)],
                put   : bind(handler.enlistIntoGroup)
            },
            "/manage":{
                before: [bind(handler.checkRole)],
                post: bind(handler.modifyGroup)
            },
            "/channels/video/:channel": {
                get   : bind(handler.getVideoChannel),
                post  : bind(handler.modifyVideoChannel),
                put   : bind(handler.createVideoChannel),
                delete: bind(handler.deleteVideoChannel)
            },
            "/channels/text/:channel": {
                get   : bind(handler.getTextChannel),
                post  : bind(handler.modifyTextChannel),
                put   : bind(handler.createTextChannel),
                delete: bind(handler.deleteTextChannel)
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

    router.attach(function(){
        this.auth = authentication(this.req);
    });

    return router;
};

var Server = function(config, router){
    var self =  this;

    var handleRequest = function(req, res){
        if (req.method == "OPTIONS") {
            res.writeHead(ErrorType.OK.code, config.cors.allowed);
            res.end();
            return;
        }

        router.dispatch(req, res, function (error) {
            res.writeHead(ErrorType.CLIENT_PATH_NOT_FOUND.code);
            res.end(ErrorType.CLIENT_PATH_NOT_FOUND.message);
        });
    };

    var nativeServer = null;
    self.start = function(){
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
server.start();

var ws = new Primus(server.getNativeServer(), {
    pathname: "/ws"
});

ws.on("connection", function (spark) {
    spark.write("hello connnection")
});

ws.authorize(function (req, done) {
    var auth = authentication(req);
    if(!auth)
        return done({});

    done();
});
