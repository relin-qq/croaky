exports = module.exports = {
    host     : "localhost",
    interface: "127.0.0.1",
    https    : 443,
    http     : 8080,
    ssl      : {
        key: "",
        cert: ""
    },
    cors : { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, HEAD",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Date, X-User"
    }
};