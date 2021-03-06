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

var authentication = function(req,cb){
    var path     = Url.parse(req.url).pathname;

    if(req.headers["authorization"]) {
        var hash     = req.headers["authorization"];
        var xdate    = req.headers["x-date"];
        var username = req.headers["x-user"];
    } else if(req.query["authorization"]) {
        var hash     = req.query["authorization"];
        var xdate    = req.query["x-date"];
        var username = req.query["x-user"];
    }
    var method   = req.method;

    if(!hash || !xdate || !username)
        return cb(ErrorType.AUTH_MISSING_FIELDS);

    //TODO: check auth here
    console.log("User sent hash: "+hash+" xdate: "+xdate+" username: "+username+" method: "+method);

    Handler.getAuthData(username, function(result) {
        console.log("DB authdata result: ",result);
        // TODO: Check auth here!
        /*
        if(!auth){
            return ErrorType.AUTH_FAILED;
        }
        */

        cb({
            user  : username,
            date  : xdate,
            method: method,
            path  : path,
            hash  : hash
        });
    });
};

var Routing = function(handler){
    //should be defined in the routing definition... because of reasons.

    var checkAuth = function(){
        var self = this;
        var next = arguments[arguments.length - 1];

        authentication(self.req, function(auth) {
            self.auth = auth;
            if(self.auth.hash != undefined) {
                next(); 
                return;
            }
            console.log(next);
            next(self.auth);
        });
    };

    //Hack workaround. Directory uses the "this" scope to work with response and request objects
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


                return next(response);
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
        "/u/:userName":{
            before: [checkAuth],
            get   : bind(handler.getUser),
            "/pm/[\*]":{
                get: bind(handler.getConversationPartnerNames)
            },
            "/pm/:otherUser":{
                get: bind(handler.getPrivateMessages)
            }
        },
        "/g/:groupName":{
            before: [checkAuth],
            "/channels/:channel": {
                get   : bind(handler.getChannel),
            },
            "/channels/([\*])":{
                get: bind(handler.getAllChannel)
            },
            "/users" : {
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
            router.dispatch(req, res, function (result) {
                console.log(result)
                res.writeHead(result.statusCode || result.status);
                res.end(JSON.stringify(result.msg || JSON.stringify(result.message) || {}));
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
