"use strict";
var Enum = require("./external/Enum.es6.js");

var Response = new Enum({
	OK                   : {value: 200, message: "Everthing went better than expected"},
	CLIENT_PATH_NOT_FOUND: {value: 404, message: "Path not Found"},
});

var expose = function(enum){
	for(key in enum){
		exports[key] = enum[key];
	}
};

expose(Response);