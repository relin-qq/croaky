var modules = {
    //Core modules
    http : require("http"),
    https: require("https"),
    url  : require("url"),
    fs   : require("fs"),
    path : require("path"),
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

    this.isValid = function(callback){

    };
};

var Routing = function(){
    var pathDefinitions = {
        "/ws":{
            before: [authentication],
            get: createWebsocket
        },
        "/users/:username" : {
            before: [authentication],
            get: getUser,
            post: modifyUser,
            "/pm/[\*]":{
                get: getConversationPartnerNames
            },
            "/pm/:otherUser":{
                get: getPrivateMessages
            }
        },
        "/register/:username":{
            put: createUser
        },
        "/groups/:groupName": {
            before: [authentication],
            put: createGroup,

            "/join/:pass":{
                before: [checkPass]
                put: enlistIntoGroup
            },
            "/manage":{
                before: [checkRole],
                post: modifyGroup,
            },
            "/channels/video/:channel": {
                get   : getVideoChannel,
                post  : modifyVideoChannel,
                put   : createVideoChannel,
                delete: deleteVideoChannel
            },
            "/channels/text/:channel": {
                get   : getTextChannel,
                post  : modifyTextChannel,
                put   : createTextChannel,
                delete: deleteTextChannel
            },
            "/channels/[\*]":{
                get: getAllChannel,
            },
            "/users/([\*])" : {
                get: getUsers,
            },
        }

    };
    
    var router = new require("director").http.Router(pathDefinitions);
    router.configure({async:true, recurse: "forward", strict : false});
};

var stores = global.store;
var pathHandler = new Routing(global.config);

var httpsConnect = function(sslOptions, cfg){
    modules.https.createServer(sslOptions, function (req, res) {
        handleRequests(req, res);
    }).listen(cfg.httpsPort, cfg.binding);
    return true;
}

var httpConnect = function(cfg){
    modules.http.createServer(function (req, res){
        handleRequests(req, res);
    }).listen(cfg.httpPort, cfg.binding); // Port 80 requires root permission 
}

var BufferedRequest = function(req){
    var self = this;

    var contentLength = req.headers["content-length"] || 0;
    var buffer = new Buffer(contentLength);
    var offset = 0;
    var ended = false;

    self.raw = req;

    req.on("data", function(chunk) {
        buffer.write(chunk, offset);
        offset += chunk.length;
    });

    req.on("end", function() {
        ended = true;
        
        if(onEndCallback)
            onEndCallback();
    }); 

    var onEndCallback;
    self.onend = function(callback) {
        onEndCallback = callback;
        
        if(ended)
            onEndCallback();
    };
};

var Server = function(config){
    var self =  this;

    var handleRequest = function(){
        if (req.method == "OPTIONS") {
            res.writeHead(global.OK, global.header.options);
            res.end();
            return;
        }

        new StreamBuffer(req);

        req.streambuffer.onend(function() {
            req.self.req.dReq = new modules.store.DRequest(userID, self.req, self.res);
            pathHandler.router.dispatch(req, res, function (err) {
                if (err) {
                    res.writeHead(global.ERROR_CLIENT.code);
                    res.end(global.ERROR_CLIENT.msg);
                }
            });
        });
    };

    self.start = function(){
        try{
            var sslOptions = {
                key: modules.fs.readFileSync(global.config.ssl.key),
                cert: modules.fs.readFileSync(global.config.ssl.cert)
            };

            modules.https.createServer(sslOptions, function (req, res) {
                handleRequests(req, res);
            }).listen(cfg.https, cfg.bind);
            modules.log.store("HTTPS- and HTTP- server started");
        }catch(e){

        }
    };
}

