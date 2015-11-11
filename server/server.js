var modules = {
    //Core modules
    http : require("http"),
    https: require("https"),
    url  : require("url"),
    fs   : require("fs"),
    path : require("path"),
}

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

var router = new this.director.http.Router(usrRoute);
router.configure({async:true, recurse: "forward", strict : false});