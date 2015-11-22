"use strict";
//Core-Nodejs Modules
var Http    = require("http");
var Https   = require("https");
var Url     = require("url");

//External Modules
var extend = require('node.extend');

//Local Modules
var Handler = require("./js/handler.js");
var Enums   = require("./js/enum.js");

var Config = require("./config.js");

var Routing = function(handler){
    //should be defined in the routing definition... because of reasons.
    var authentication = function(req){
        var path     = Url.parse(this.req.url).pathname;

        var hash     = req.headers["authorization"];
        var xdate    = req.headers["x-date"];
        var username = req.headers["x-user"];
        var method   = req.method;

        if(!hash || !xdate || !username)
            return next(false);

        //TODO: check auth here
        if(!auth)
            return next(false);
 
        return {
            user  : username,
            date  : xdate,
            method: method,
            path  : path,
            hash  : hash
        };
    };

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
        "/g/:groupName"{
            before: [checkAuth],
            put: handler.createGroup,
            "/join/:pass":{
                before: [handler.checkPass]
                put: handler.enlistIntoGroup
            },
            "/manage":{
                before: [handler.checkRole],
                post: handler.modifyGroup,
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
                get: handler.getAllChannel,
            },
            "/users/([\*])" : {
                get: handler.getAllGroupUsers,
            }
        }        
    };
    
    var router = new require("director").http.Router(pathDefinitions);
    router.configure({
        async  : true,
        strict : false,
        recurse: "forward"
    });

    router.attach(function(){
        this.auth = authentication(this.req);
    });
};

var Server = function(config, router){
    var self =  this;
    var router = new Routing(modules.Handler);

    var handleRequest = function(req, res){
        if (req.method == "OPTIONS") {
            res.writeHead(Enum.OK, config.cors.allowed);
            res.end();
            return;
        }

        router.dispatch(req, res, function (error) {
            if (error) {
                res.writeHead(Enum.CLIENT_PATH_NOT_FOUND);
                res.end(Enum.CLIENT_PATH_NOT_FOUND.message);
            }
        });
    };

    self.start = function(){
        try{
            //Trying to start HTTPS-Server
            var sslOptions = {
                key: modules.fs.readFileSync(config.ssl.key),
                cert: modules.fs.readFileSync(config.ssl.cert)
            };

            Https.createServer(sslOptions, function (req, res) {
                handleRequests(req, res);
            }).listen(config.https, config.bind);

        }catch(e){
            //HTTP Fallback
            Http.createServer(function (req, res) {
                handleRequests(req, res);
            }).listen(config.https, config.bind);
        }
    };
}

//TODO: use "extend" and check with template

var server = new Server(Config, new Routing(Handler));
server.start();
