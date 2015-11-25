"use strict";
// var Enum = require("./external/Enum.es6.js");

var Response = {
	OK                   : {value: 200, message: "Everthing went better than expected"},
	CLIENT_PATH_NOT_FOUND: {value: 404, message: "Path not Found"},
};

var expose = function(res){
	for(var key in res){
		exports[key] = res[key];
	}
};

expose(Response);