"use strict";
//Core-Nodejs Modules
var Url       = require("url");
var Fs        = require("fs");

//Local Modules
var ErrorType = require("./errortype.js");
var Templates = require("./templates.js");
var Database  = require("./db.js").create("./db/db.sql");


var createWebsocket = function(){
    console.log("ws")
};

var getAuthData = function(userName, callback){
    Database.getAuthData(userName, function(error, result){
        if(error)
            callback(error);
        callback(result);
    });
}

var getUser = function(userName, callback){
    Database.getUser(userName, function(error, result){
        if(error)
            callback(null, error);

        console.log("Get user: ",error, result);
        if(!result) {
            callback({
                status: 404
            });
            return;
        }
        
        callback({
            status: 200,
            msg: {username: result.username,email: result.email}
        });
    });
};

var modifyUser = function(userName, callback){

};

var getConversationPartnerNames = function(userName, callback){

};

var getPrivateMessages = function(userName, targetUsername, callback){

};

var createUser = function(userName, callback){
    //TODO: check with template
    Database.createUser(userName, this.data.email, this.data.password, function(error){
        if(error)
            callback(null, error);

        callback({
            status: 200
        });
    });
};

var createGroup = function(groupName, callback){
    console.log("Handler: createGroup");
    console.log(callback);
    Database.createGroup(groupName, function(error, result){
        console.log(error);
        console.log(callback);
        if(error)
            callback(null, error);

        callback({
            status: 200
        });
    });
};

var checkGroupPass = function(groupName, pass, callback){
    callback();
};

var enlist = function(userName, groupName, pass, callback){
    Database.enlist(userName, groupName, function(error, result){
        console.log(callback);
        //console.log(result);
        if(error)
            callback(null, error);

        callback({
            status: 200
        });
    });
};

var unenlist = function(groupName, pass, callback){
    Database.unenlist(this.auth.user, groupName, function(error, result){
        console.log(result);
        if(error)
            callback(null,error);

        callback({
            status: 200
        });
    });
};


var checkRole = function(groupName, role, callback){

};

var modifyGroup = function(callback){

};

var getChannel = function(callback){

};

var modifyChannel = function(callback){

};

var createChannel = function(groupName, channelName, callback){
    Database.createChannel(channelName, groupName, function(error, result){
        console.log(callback);
        //console.log(result);
        if(error)
            callback(null, error);

        callback({
            status: 200
        });
    });
};

var deleteChannel = function(callback){

};

var getAllChannel = function(groupName, callback){
    console.log("getAllChannel");
    Database.getAllChannel(groupName, function(error, result){
        console.log(result);
        if(error)
            callback(null,error);

        callback({
            status: 200
        });
    });
};

var joinChannel = function(channel,pass,callback){

};

var getUsers = function(callback){

};

exports.createWebsocket = createWebsocket;
exports.getAuthData = getAuthData;
exports.getUser = getUser;
exports.modifyUser = modifyUser;
exports.getConversationPartnerNames = getConversationPartnerNames;
exports.getPrivateMessages = getPrivateMessages;
exports.createUser = createUser;
exports.createGroup = createGroup;
exports.checkGroupPass = checkGroupPass;
exports.enlist = enlist;
exports.unenlist = unenlist;
exports.checkRole = checkRole;
exports.modifyGroup = modifyGroup;
exports.getChannel = getChannel;
exports.modifyChannel = modifyChannel;
exports.createChannel = createChannel;
exports.deleteChannel = deleteChannel;
exports.getAllChannel = getAllChannel;
exports.getUsers = getUsers;
