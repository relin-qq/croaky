"use strict";
//Core-Nodejs Modules
var Http     = require("http");
var Https    = require("https");
var Url      = require("url");
var Director = require("director");

//External Modules
var Extend   = require("extend");
var Primus   = require("primus");

//Local Modules
var Handler  = require("./js/handler.js");
var Enums    = require("./js/enum.js");

var authentication = function(req){
    var path     = Url.parse(req.url).pathname;

    var hash     = req.headers["authorization"];
    var xdate    = req.headers["x-date"];
    var username = req.headers["x-user"];
    var method   = req.method;

    if(!hash || !xdate || !username)
        return false;

    //TODO: check auth here
    if(!auth)
        return false;

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

    var checkAuth = function(next){
        next(!!this.auth); 
    };

    var pathDefinitions = {
        "/ws":{
            get: handler.createWebsocket
        },
        "/r/:username":{
            put: handler.createUser
        },
        "/u/:userName":{
            before: [checkAuth],
            get: handler.getUser,
            post: handler.modifyUser,
            "/pm/[\*]":{
                get: handler.getConversationPartnerNames
            },
            "/pm/:otherUser":{
                get: handler.getPrivateMessages
            }
        },
        "/g/:groupName":{
            before: [checkAuth],
            put: handler.createGroup,
            "/join/:pass":{
                before: [handler.checkPass],
                put: handler.enlistIntoGroup
            },
            "/manage":{
                before: [handler.checkRole],
                post: handler.modifyGroup
            },
            "/channels/video/:channel": {
                get   : handler.getVideoChannel,
                post  : handler.modifyVideoChannel,
                put   : handler.createVideoChannel,
                delete: handler.deleteVideoChannel
            },
            "/channels/text/:channel": {
                get   : handler.getTextChannel,
                post  : handler.modifyTextChannel,
                put   : handler.createTextChannel,
                delete: handler.deleteTextChannel
            },
            "/channels/[\*]":{
                get: handler.getAllChannel
            },
            "/users/([\*])" : {
                get: handler.getAllGroupUsers
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
            res.writeHead(Enum.OK.value, config.cors.allowed);
            res.end();
            return;
        }

        router.dispatch(req, res, function (error) {
            if (error) {
                res.writeHead(Enum.CLIENT_PATH_NOT_FOUND.value);
                res.end(Enum.CLIENT_PATH_NOT_FOUND.message);
            }
        });
    };

    var nativeServer = null;
    self.start = function(){
        try{
            //Trying to start HTTPS-Server
            var sslOptions = {
                key: modules.fs.readFileSync(config.ssl.key),
                cert: modules.fs.readFileSync(config.ssl.cert)
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
        var buffer = require("fs").readFileSync(path);
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

ws.on('connection', function (spark) {
    console.log("lol")
    spark.write('hello connnection')
});

ws.authorize(function (req, done) {
    var auth = authentication(req);
    if(auth)
        return done(false);

    done(true);
});
