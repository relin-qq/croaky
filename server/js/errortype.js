"use strict";
// var Enum = require("./external/Enum.es6.js");

var Response = {
    OK                   : {status: 200, message: "Everthing went better than expected"},
    CLIENT_PATH_NOT_FOUND: {status: 404, message: "Path not Found"},
    AUTH_FAILED          : {status: 400, message: "Auth Failed"},
    AUTH_MISSING_FIELDS  : {status: 400, message: "Missing Auth Fields"}
};

var expose = function(res){
    for(var key in res){
        exports[key] = res[key];
    }
};

expose(Response);