var Primus    = require("primus");

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


var FLAGS = {
    GROUP_JOIN       : 0, 
    VIDEO_JOIN       : 1, 
    CHANNEL_JOIN     : 2,
    ONLINE_STATE     : 4,
    INTERACTION_STATE: 8,
    PING             : 16,
    CHANNEL_POST     : 32,
    GROUP_LEAVE      : 64,
    VIDEO_LEAVE      : 128
}

var tryJSON = function(string){
    try {
        return JSON.parse(string);
    }catch(e){
        console.log(e);
        return null;
    }
};

var WebsocketManager = function(server){
    //Websocket server on listening on the /ws path
    var ws = new Primus(server.getNativeServer(), {
        pathname: "/ws"
    });

    ws.authorize(function (req, done) {
        var auth = server.authentication(req);
        if(!auth)
            return done({});

        done();
    });

    ws.on("connection", function (spark) {
        spark.write("hello connnection")
    });
};

exports.WebsocketManager = WebsocketManager;