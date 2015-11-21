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

var Routing = function(handler){

    //should be defined in the routing definition... because of reasons.
    var authentication = function(req){
        var path     = require("url").parse(this.req.url).pathname;

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
            user: username,
            date: xdate,
            method: method,
            path: path,
            hash: hash
        };
    };

    var checkAuth = function(next){
        next(!!this.auth); 
    };

    var pathDefinitions = {
        "/register/":{
            "/:username":{
                put: handler.createUser
            }
        },
        "/f/":{
            before: [checkAuth],
            "/ws":{
                get: handler.createWebsocket
            },
            "/users/:username" : {
                get: handler.getUser,
                post: handler.modifyUser,
                "/pm/[\*]":{
                    get: handler.getConversationPartnerNames
                },
                "/pm/:otherUser":{
                    get: handler.getPrivateMessages
                }
            },
            "/groups/:groupName": {
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
        }
        
    };
    
    var router = new require("director").http.Router(pathDefinitions);
    router.configure({
        async:true,
        recurse: "forward",
        strict : false
    });

    router.attach(function(){
        this.auth = authentication(this.req);
    });
};

var Server = function(config, router){
    var self =  this;
    var router = new Routing(modules.handler);

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

