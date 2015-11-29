"use strict";
// var Enum = require("./external/Enum.es6.js");

var Response = {
    OK                   : {code: 200, message: "Everthing went better than expected"},
    CLIENT_PATH_NOT_FOUND: {code: 404, message: "Path not Found"},
    AUTH_FAILED          : {code: 400, message: "Auth Failed"},
    AUTH_MISSING_FIELDS  : {code: 400, message: "Missing Auth Fields"}
};

var expose = function(res){
    for(var key in res){
        exports[key] = res[key];
    }
};

expose(Response);