var Fs =  require("fs");
var Util = require("util");
//External Modules
var Extend = require("extend");
var SQL    = require("sqlite3").verbose();

var SQLERROR = {
    "SQLITE_ERROR"     : 500, /* SQL error or missing database */
    "SQLITE_INTERNAL"  : 500, /* Internal logic error in SQLite */
    "SQLITE_PERM"      : 403, /* Access permission denied */
    "SQLITE_ABORT"     : 400, /* Callback routine requested an abort */
    "SQLITE_BUSY"      : 500, /* The database file is locked */
    "SQLITE_LOCKED"    : 500, /* A table in the database is locked */
    "SQLITE_NOMEM"     : 500, /* A malloc() failed */
    "SQLITE_READONLY"  : 500, /* Attempt to write a readonly database */
    "SQLITE_INTERRUPT" : 500, /* Operation terminated by sqlite3_interrupt()*/
    "SQLITE_IOERR"     : 500, /* Some kind of disk I/O error occurred */
    "SQLITE_CORRUPT"   : 500, /* The database disk image is malformed */
    "SQLITE_NOTFOUND"  : 500, /* Unknown opcode in sqlite3_file_control() */
    "SQLITE_FULL"      : 500, /* Insertion failed because database is full */
    "SQLITE_CANTOPEN"  : 500, /* Unable to open the database file */
    "SQLITE_PROTOCOL"  : 500, /* Database lock protocol error */
    "SQLITE_EMPTY"     : 500, /* Database is empty */
    "SQLITE_SCHEMA"    : 500, /* The database schema changed */
    "SQLITE_TOOBIG"    : 500, /* String or BLOB exceeds size limit */
    "SQLITE_CONSTRAINT": 403, /* Abort due to constraint violation */
    "SQLITE_MISMATCH"  : 400, /* Data type mismatch */
    "SQLITE_MISUSE"    : 500, /* Library used incorrectly */
    "SQLITE_NOLFS"     : 500, /* Uses OS features not supported on host */
    "SQLITE_AUTH"      : 401, /* Authorization denied */
    "SQLITE_FORMAT"    : 500, /* Auxiliary database format error */
    "SQLITE_RANGE"     : 500, /* 2nd parameter to sqlite3_bind out of range */
    "SQLITE_NOTADB"    : 200, /* File opened that is not a database file */
    "SQLITE_ROW"       : 200, /* sqlite3_step() has another row ready */
    "SQLITE_DONE"      : 200 /* sqlite3_step() has finished executing */
};

var STATEMENTS = {
    "select" : {
        user      : "SELECT * FROM users WHERE username = ?",
        auth      : "SELECT * FROM users WHERE username = ?",
        enlistment: "SELECT groupname FROM groups WHERE username = ?",
        groupUsers: "SELECT username FROM groups WHERE groupname = ?",
        channel   : "SELECT info FROM channels WHERE channelname = ? AND groupname = ?",
        channels  : "SELECT channelname AND groupname FROM channels WHERE groupname = ?"
    },
    "update" : {

    },
    "insert" : {
        enlistment: "INSERT INTO enlistments(groupname, username) VALUES (?,?)",
        user      : "INSERT INTO users(username, email, password) VALUES (?,?,?)",
        group    : "INSERT INTO groups(groupname) VALUES (?)",
        channel  : "INSERT INTO channels(channelname, groupname) VALUES (?,?)"
    },
    "delete" : {
        enlistment: "DELETE FROM enlistments WHERE groupname = ? AND username = ?"
    },
    "create" : {
        users       : "CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT, password TEXT)",
        groups      : "CREATE TABLE IF NOT EXISTS groups (groupname TEXT PRIMARY KEY)",
        enlistments : "CREATE TABLE IF NOT EXISTS enlistments (enlistID INTEGER PRIMARY KEY AUTOINCREMENT, groupname TEXT, username TEXT, FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE, FOREIGN KEY (groupname) REFERENCES groups(groupname) ON DELETE CASCADE, UNIQUE (groupname, username))",
        channels    : "CREATE TABLE IF NOT EXISTS channels (channelID INTEGER PRIMARY KEY AUTOINCREMENT, channelname TEXT, groupname TEXT, info TEXT, FOREIGN KEY (groupname) REFERENCES groups(groupname) ON DELETE CASCADE, UNIQUE(channelname, groupname))"
    }
};

var createError = function(error){
    return {
        statusCode: SQLERROR[error.code],
        msg: error.toString()
    };
};

//I like this style of defining class methods
//TODO: maybe performance drawbacks ? https://developers.google.com/speed/articles/optimizing-javascript?csw=1
var Database = function(path) {
    var self = this;
    var db = new SQL.Database(path);

    //Create tables if db does not have them
    db.serialize(function() {
        //Foreign keys must be activated
        db.run("PRAGMA foreign_keys = on;");
        db.run(STATEMENTS.create.channels);
        db.run(STATEMENTS.create.users);
        db.run(STATEMENTS.create.groups);
        db.run(STATEMENTS.create.enlistments);
    });

    self.getUser = function(userName, callback){
        db.get(STATEMENTS.select.user, [userName], function(error, row){
            if(error)
                return callback(createError(error));

            callback(null, row);
        });
    };
    
    self.getAuthData = function(userName, callback){
        db.get(STATEMENTS.select.auth, [userName], function(error, row){
            if(error)
                return callback(createError(error));

            callback(null, row);
        });
    };

    self.modifyUser = function(){

    };

    self.getConversationPartnerNames = function(){

    };

    self.getPrivateMessages = function(){

    };

    self.createUser = function(userName, email, password, callback){
        //TODO: Password Hashing
        db.run(STATEMENTS.insert.user, [userName, email, password], function(error){
            if(error)
                return callback(createError(error));

            callback(null);
        });
    };

    self.createGroup = function(groupName, callback){
        db.run(STATEMENTS.insert.group, [groupName], function(error){
            if(error)
                return callback(createError(error));

            callback(null);
        });
    };

    self.checkGroupPass = function(pass, callback){
        //TODO: Enable groups with passwords. Needs DB work.
        callback(null);
    };

    self.enlist = function(userName, groupName, callback){
        db.run(STATEMENTS.insert.enlistment, [groupName, userName], function(error){
            if(error)
                return callback(createError(error));

            callback(null);
        });
    };
    
    self.unenlist = function(userName, groupName, callback){
        db.run(STATEMENTS.delete.enlistment, [groupName, userName], function(error){
            if(error)
                return callback(createError(error));

            callback(null);
        });
    };

    self.cancelEnlistment = function(userName, groupName){
        db.run(STATEMENTS.delete.enlistment, [groupName, userName], function(error){
            if(error)
                return callback(createError(error));

            callback(null);
        });
    };

    self.checkRole = function(){

    };

    self.modifyGroup = function(){

    };

    self.getChannel = function(){
        db.get(STATEMENTS.select.channel, [channel, group], function(error, row){
            if(error)
                return callback(createError(error));

            callback(null, row);
        });
    };

    self.modifyChannel = function(){

    };

    self.createChannel = function(channelName, groupName, callback){
        db.run(STATEMENTS.insert.channel, [channelName, groupName], function(error){
            if(error)
                return callback(createError(error));

            callback(null);
        });
    };

    self.deleteChannel = function(){

    };

    self.getAllChannel = function(groupName,callback){
        console.log("DB getAllChannel: ",callback);
        console.log(groupName);
        db.all(STATEMENTS.select.channels, [groupName], function(error, rows){
            if(error)
                return callback(createError(error));
            
            callback(null, rows);
        });
    };
};

exports.create = function(path){
    Util.log("Database Path:",require("path").resolve(path));
    return new Database(path);
};
