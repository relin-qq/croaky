var modules = {
    //Core modules
    http : require("http"),
    https: require("https"),
    url  : require("url"),
    fs   : require("fs"),
    path : require("path"),
    fallback: require("./js/fallback.js"),
    handler: require("./js/handler.js")
}


var Authentication = function(req){
    var self = this;
    self.path = require("url").parse(req.url).pathname;
    self.xdate = req.headers["x-date"];
    self.hash = req.headers["authorization"];
    self.username = req.headers["x-user"];
    self.method = req.method;

    if(!hash || !xdate || !username)
        return;

    self.isValid = function(callback){

    };
};

var Routing = function(){
    var pathDefinitions = {
        "/ws":{
            before: [authentication],
            get: handler.createWebsocket
        },
        "/users/:username" : {
            before: [authentication],
            get: handler.getUser,
            post: handler.modifyUser,
            "/pm/[\*]":{
                get: handler.getConversationPartnerNames
            },
            "/pm/:otherUser":{
                get: handler.getPrivateMessages
            }
        },
        "/register/:username":{
            put: handler.createUser
        },
        "/groups/:groupName": {
            before: [authentication],
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
                get: handler.getUsers,
            },
        }
    };
    
    var router = new require("director").http.Router(pathDefinitions);
    router.configure({async:true, recurse: "forward", strict : false});
};

var Server = function(config, router){
    var self =  this;
    var router = new Routing(global.config);

    var handleRequest = function(req, res){
        if (req.method == "OPTIONS") {
            res.writeHead(global.OK, global.header.options);
            res.end();
            return;
        }

        router.dispatch(req, res, function (err) {
            if (err) {
                res.writeHead(global.ERROR_CLIENT.code);
                res.end(global.ERROR_CLIENT.msg);
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

            modules.https.createServer(sslOptions, function (req, res) {
                handleRequests(req, res);
            }).listen(config.https, config.bind);

            modules.log.store("HTTPS- and HTTP- server started");
        }catch(e){
            //HTTP Fallback
            modules.http.createServer(function (req, res) {
                handleRequests(req, res);
            }).listen(config.https, config.bind);
        }
    };
}

