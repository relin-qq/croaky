var Fs =  require("fs");
//External Modules
var Extend = require("extend");
var SQL    = require("sqlite3").verbose();

var STATEMENTS = {
    "select" : {
        user     : "SELECT * FROM users WHERE username = ?",
        enlistment: "SELECT groupname FROM groups WHERE username = ?",
        groupUsers: "SELECT username FROM groups WHERE groupname = ?",
    },
    "update" : {

    },
    "insert" : {
        enlistment: "INSERT INTO enlistments(groupname, username) VALUES (?,?)",
        user      : "INSERT INTO users(username, email, password) VALUES (?,?,?)",
        groups    : "INSERT INTO groups(groupname) VALUES (?)"
    },
    "delete" : {
        groupUser: "DELETE FROM enlistment WHERE groupname = ? AND username = ?"
    },
    "create" : {
        users       : "CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT, password TEXT)",
        groups      : "CREATE TABLE IF NOT EXISTS groups (groupname TEXT PRIMARY KEY)",
        enlistments : "CREATE TABLE IF NOT EXISTS enlistments (enlistID INTEGER PRIMARY KEY AUTOINCREMENT, groupname TEXT, username TEXT, FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE, FOREIGN KEY (groupname) REFERENCES groups(groupname) ON DELETE CASCADE, UNIQUE (groupname, username))",
    }
}

//I like this style of defining class methods
//TODO: maybe performance drawbacks ? https://developers.google.com/speed/articles/optimizing-javascript?csw=1
var Database = function(path) {
    var self = this;
    var db = new SQL.Database(path);

    //Create tables if db does not have them
    db.serialize(function() {
        //Foreign keys must be activated
        db.run("PRAGMA foreign_keys = on;");
        db.run(STATEMENTS.create.users);
        db.run(STATEMENTS.create.groups);
        db.run(STATEMENTS.create.enlistments);
    });

    self.getUser = function(userName, callback){
        db.get(STATEMENTS.select.user, [userName], function(error, row){
            if(error)
                return callback(error);

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
        console.log(arguments)
        //TODO: Password Hashing
        db.run(STATEMENTS.insert.user, [userName, email, password], function(error){
            if(error)
                return callback(error);

            callback(null);
        });
    };

    self.createGroup = function(groupName, callback){
        db.run(STATEMENTS.insert.group, [groupName], function(error){
            if(error)
                return callback(error);

            callback(null);
        });
    };

    self.checkPass = function(){

    };

    self.enlist = function(userName, groupName){
        db.run(STATEMENTS.insert.enlistment, [groupName, userName], function(error){
            if(error)
                return callback(error);

            callback(null);
        });
    };

    self.cancelEnlistment = function(userName, groupName){
        db.run(STATEMENTS.delete.enlistment, [groupName, userName], function(error){
            if(error)
                return callback(error);

            callback(null);
        });
    };

    self.checkRole = function(){

    };

    self.modifyGroup = function(){

    };

    self.getVideoChannel = function(){

    };

    self.modifyVideoChannel = function(){

    };

    self.createVideoChannel = function(){

    };

    self.deleteVideoChannel = function(){

    };

    self.getTextChannel = function(){

    };

    self.modifyTextChannel = function(){

    };

    self.createTextChannel = function(){

    };

    self.deleteTextChannel = function(){

    };

    self.getAllChannel = function(){

    };

    self.getUser = function(){

    };
};

exports.create = function(path){
    console.log(require("path").resolve(path));
    return new Database(path);
};