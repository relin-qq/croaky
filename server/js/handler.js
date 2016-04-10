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
    Database.createGroup(this.auth.user, groupName, function(error){
        console.log(error);
    });
};

var checkPass = function(groupName, pass, callback){
    callback();
};

var enlist = function(groupName, callback){
    Database.enlist(this.auth.user, groupName, function(error, result){
        console.log(result);
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

var createChannel = function(callback){

};

var deleteChannel = function(callback){

};

var getAllChannel = function(callback){

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
exports.checkPass = checkPass;
exports.enlist = enlist;
exports.checkRole = checkRole;
exports.modifyGroup = modifyGroup;
exports.getChannel = getChannel;
exports.modifyChannel = modifyChannel;
exports.createChannel = createChannel;
exports.deleteChannel = deleteChannel;
exports.getAllChannel = getAllChannel;
exports.getUsers = getUsers;
