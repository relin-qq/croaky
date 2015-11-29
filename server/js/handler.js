"use strict";
var createWebsocket = function(){
	console.log("ws")
};

var getUser = function(userName, callback){
	callback({
		code: 200,
		msg:{
			username: userName
		}
	})
};

var modifyUser = function(userName, callback){

};

var getConversationPartnerNames = function(userName, callback){

};

var getPrivateMessages = function(userName, targetUsername, callback){

};

var createUser = function(userName, callback){

};

var createGroup = function(groupName, callback){

};

var checkPass = function(groupName, pass, callback){

};

var enlistIntoGroup = function(groupName, callback){

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
exports.enlistIntoGroup = enlistIntoGroup;
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
