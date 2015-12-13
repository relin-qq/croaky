"use strict";
//Core-Nodejs Modules
var Url       = require("url");
var Fs        = require("fs");

//Local Modules
var ErrorType = require("./errortype.js");
var Templates = require("./templates.js");
var Database = require("./db.js").create("./db/db.sql");


var createWebsocket = function(){
    console.log("ws")
};

var getUser = function(userName, callback){
    Database.getUser(userName,"bla", "bla", function(error, result){
        console.log(error, result);
    });
};

var modifyUser = function(userName, callback){

};

var getConversationPartnerNames = function(userName, callback){

};

var getPrivateMessages = function(userName, targetUsername, callback){

};

var createUser = function(userName, callback, errorCallback){
    //TODO: check with template
    Database.createUser(userName, this.data.email, this.data.password, function(error){
        if(error)
            callback(null, error);

        callback({
            code: 200
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

var getVideoChannel = function(callback){

};

var modifyVideoChannel = function(callback){

};

var createVideoChannel = function(callback){

};

var deleteVideoChannel = function(callback){

};

var getTextChannel = function(callback){

};

var modifyTextChannel = function(callback){

};

var createTextChannel = function(callback){

};

var deleteTextChannel = function(callback){

};

var getAllChannel = function(callback){

};

var getUsers = function(callback){

};

exports.createWebsocket = createWebsocket;
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
exports.getVideoChannel = getVideoChannel;
exports.modifyVideoChannel = modifyVideoChannel;
exports.createVideoChannel = createVideoChannel;
exports.deleteVideoChannel = deleteVideoChannel;
exports.getTextChannel = getTextChannel;
exports.modifyTextChannel = modifyTextChannel;
exports.createTextChannel = createTextChannel;
exports.deleteTextChannel = deleteTextChannel;
exports.getAllChannel = getAllChannel;
exports.getUsers = getUsers;
