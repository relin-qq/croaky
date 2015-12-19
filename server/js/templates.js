var templates = {
    config: {
        host     : "localhost",
        interface: "0.0.0.0",
        https    : 443,
        http     : 8080,
        ssl      : {
            key: "",
            cert: ""
        },
        cors : { },
    },
    register:{
        name: "/(\w+)/",
        email: "/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i",
        password: "/(\w+)/"
    },
    register:{
        name: "/(\w+)/",
        email: "/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i",
        password: "/(\w+)/"
    },
    channel: {
        name: "/(\w+)/"
    },
    group: {^
        name: "/(\w+)/"
    },
    database: {
        getUser                    : function(){},
        modifyUser                 : function(){},
        getConversationPartnerNames: function(){},
        getPrivateMessages         : function(){},
        createUser                 : function(){},
        createGroup                : function(){},
        checkPass                  : function(){},
        enlist                     : function(){},
        checkRole                  : function(){},
        modifyGroup                : function(){},
        getChannel                 : function(){},
        modifyChannel              : function(){},
        createChannel              : function(){},
        deleteChannel              : function(){},
        getTextChannel             : function(){},
        modifyTextChannel          : function(){},
        createTextChannel          : function(){},
        deleteTextChannel          : function(){},
        getAllChannel              : function(){},
        getUser                    : function(){}
    }
};

exports.check = function(templateKey, callback){
    var tempalte = templates[templateKey];
    console.log(this.req.body)
    return;
};