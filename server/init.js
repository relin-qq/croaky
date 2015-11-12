var store = require("./datastore");
var bson = require("bson").pure().BSON;
var states = require("./enums").states;

global.templates = {
	config: {
		host : "",
		store: "",
		binding : "",
		logtoken:"",
		httpsPort : 0,
		httpPort :0,
		database: "",
		useActivation : false,
		ssl: {
				key: "",
		  		cert: ""
  		},
	  	smtp : {
		    host: "", // hostname
		    secureConnection: true, // use SSL
		    port: 0 // port for secure SMTP
		}
	},
	container: {
	    path : "", // Relativer Pfad des Objektes - URL ohne hostname. Beispiel: viktor@viktorserver.de/_s/post/42
        author: "", // Autor des Datenobjektes im UserID-Format
        signature : "", // Signatur, die vom Client erstellt wurde. Geht über id, author, mime-type und data.
        mimetype : "", // Mime-Typ, der den Datentyp bestimmt. (DEFAULT: application/octet-stream)
        data : {} // Der Payload bzw. die verschlüsselten Daten.
	},
	register: {
		password: "",
		email: ""
	},
	remote: {
       userID: "", // UserID muss der Spezifikation in Kapitel 1.1 entsprechen.
       certificate : "", // Zertifikat des Remotes.
	},
	acl: {
       group : "string", // Der name des Circles
       users : [], // Liste von User
       permissions: {}  
	},
	checkWithTemplate : function(templateKey, object){
		if(typeof(templateKey) != "string")
			throw "1 Parameter ist not typeof string";
		var template = this[templateKey];

		var realCheck = function(template, object) {
			for(k in template){

				if(!(k in object)){
					throw "Missing key " + k;
				}
				if(typeof(object[k]) != typeof(template[k])){
					throw "Key "+ k + " has wrong type";
				}
				if(typeof(template[k]) == "object")
					return realCheck(template[k], object[k])
			}
		}

		realCheck(template, object);
		return object;
	}
};

for(var key in states){
    global[key] = states[key];
}

global.helloObj = bson.serialize({sonet : true});

global.header = {
    options : { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, HEAD",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Date, X-User"
    },
};

var path = process.cwd();
try {
    var buffer = require("fs").readFileSync(require("path").join(path,"config.json"));
    var tmp = JSON.parse(buffer.toString("utf8"));
    global.config = global.templates.checkWithTemplate("config", tmp);
}
catch (e) {
    throw "Please move the ./templates/config.json to ./config.json: " + e.toString();
}