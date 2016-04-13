var Primus    = require("primus");
var Handler   = require("./handler.js");
var ErrorType   = require("./errortype.js");

// reconnect        | scheduled | public  client  We're scheduling a reconnect.
// reconnect        | public    | client  Reconnect attempt is about to be made.
// reconnected      | public    | client  Successfully reconnected.
// reconnect        | timeout   | public  client  Reconnect attempt took too much time.
// reconnect        | failed    | public  client  Failed to reconnect.
// timeout          | public    | client  Failed to connect to server.
// open             | public    | client  Connection is open.
// destroy          | public    | client  The instance has been destroyed.
// error            | public    | client/spark    An error happened.
// data             | public    | client/spark    We received data.
// end              | public    | client/spark    The connection has ended.
// close            | public    | client/server   The connection has closed, we might reconnect. / The server has been destroyed.
// connection       | public    | server  We received a new connection.
// disconnection    | public    | server  We received a disconnection.
// initialised      | public    | server  The server is initialised.
// plugin           | public    | server  A new plugin has been added.
// plugout          | public    | server  A plugin has been removed.
// heartbeat        | public    | spark   We've received a heartbeat and have reset the timer.
// online           | public    | client  We've regained a network connection.
// offline          | public    | client  We've lost our internet connection.
// log              | public    | server  Log messages.
// readyStateChange | public    | client/spark    The readyState has changed.

var dir = "../client/";

var FLAGS = {
    GROUP_JOIN       : 0, 
    GROUP_LEAVE      : 1,
    CHANNEL_JOIN     : 2,
    CHANNEL_LEAVE    : 3,
    CHANNEL_MSG      : 4,
    ONLINE_STATE     : 5,
    INTERACTION_STATE: 6
};

var WebsocketManager = function(server){
    var clients = {};

    var handleIncomingData = function(data){
        var self = this;
        console.log("handleIncomingData: ",self.croaky.user);
        switch(data.op) {
            case FLAGS.GROUP_JOIN:
                Handler.enlist(self.croaky.user,data.groupName,data.pass,function(result,error) {
                    if(error) {
                        self.write({op: FLAGS.GROUP_JOIN, result:error.code, cause:error});
                        return;
                    }
                    self.write({op: FLAGS.GROUP_JOIN, result:result.status});
                });
                break;
            default:
                console.log("Unknown opcode in websocket: ",data);
        }
    };

    //Websocket server on listening on the /ws path
    var primus = new Primus(server.getNativeServer(), {
        pathname: "/ws",
        transformer: 'websockets'
    });

    primus.authorize(function (req, done) {
        var auth = server.authentication(req,function(result) {
            console.log("WS AUTH: ",result);
            if(!result.user) {
                done(result);
            }
            done();
        });
    });

    primus.on("connection", function (spark) {
        console.log("WS: New websocket connection",spark);
        spark.croaky = {user: spark.query["x-user"]};
        clients[spark.id] = spark;
        spark.on("data", handleIncomingData);
    });

    primus.on("disconnection", function(spark){
        delete clients[spark.id];
    });
    
    primus.save(dir +'/primus.js');
};

exports.WebsocketManager = WebsocketManager;
