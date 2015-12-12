var path   = require("path");
//External Modules
var Extend = require("extend");
var Sql    = require("sqlite3").verbose();

var STATEMENTS = {
	select : {
		// activation : "SELECT activationID, isActive FROM datastores WHERE userID = ?",
		// permission : "SELECT permissions.permission FROM permissions LEFT JOIN acl ON permissions.permID = acl.permID WHERE (permissions.isPublic = 1 AND permissions.dirID = ?) OR (acl.remoteRowID = (SELECT remoteRowID FROM remotes WHERE remotes.remoteID = ? AND remotes.userID = ? LIMIT 1) AND permissions.dirID = ?)",
		// groups     : "SELECT * FROM groups WHERE userID = ?",
		// group      : "SELECT * FROM groups WHERE groupName = ? AND userID = ?",
		// groupUsers : "SELECT remotes.remoteID AS remoteID FROM remotes LEFT JOIN acl ON remotes.remoteRowID = acl.remoteRowID WHERE acl.groupID = ?",
		// permissions: "SELECT * FROM permissions WHERE groupID = ?"
	},
	update : {
		// file : "UPDATE OR FAIL files SET _lastedited = ? WHERE fileID = ?",
		// datastores: "UPDATE OR FAIL datastores SET activationID = ? WHERE userID = ?",
		// isactiveupdate: "UPDATE OR FAIL datastores SET isActive = ? WHERE userID = ?"
	},
	insert : {
		// reg : "INSERT INTO datastores VALUES (?, ?, ?, ?, ?, ?)",
		// remote: "INSERT INTO remotes(remoteID, certificate, userID, _timestamp) VALUES (?,?,?,?)",
		// group : "INSERT INTO groups(groupName, userID) VALUES (?,?)",
		// permission : "INSERT INTO permissions(groupID, permission, dirID, path, isPublic) VALUES (?,?,?,?,?)",
		// acl : "INSERT INTO acl(remoteRowID, groupID, permID) VALUES (?,?,?)"
	},
	delete : {
		// group: "DELETE FROM groups WHERE groupName = ? AND userID = ?"
	},
	create : {
		// files      : "CREATE TABLE IF NOT EXISTS files (fileID INTEGER PRIMARY KEY ASC, filename TEXT, dirID INTEGER, userID TEXT NOT NULL, path Text, author TEXT, mimetype TEXT, _timestamp INTEGER, _lastedited INTEGER, _length INTEGER, FOREIGN KEY (userID) REFERENCES datastores(userID) ON DELETE CASCADE, FOREIGN KEY (dirID) REFERENCES dirs(dirID) ON DELETE CASCADE, UNIQUE (dirID, filename, userID, path))",
		// dirs       : "CREATE TABLE IF NOT EXISTS dirs (dirID INTEGER PRIMARY KEY ASC AUTOINCREMENT, dirname TEXT, parentDirID INTEGER, FOREIGN KEY (parentDirID) REFERENCES dirs(dirID) ON DELETE CASCADE, UNIQUE (dirname, parentDirID))",
		// datastores : "CREATE TABLE IF NOT EXISTS datastores (userID TEXT PRIMARY KEY ASC, email TEXT, password TEXT, _timestamp INTEGER, activationID TEXT, isActive INTEGER DEFAULT 0)",
		// remotes    : "CREATE TABLE IF NOT EXISTS remotes (remoteRowID INTEGER PRIMARY KEY ASC AUTOINCREMENT,remoteID TEXT, certificate TEXT, userID TEXT, _timestamp INTEGER, FOREIGN KEY (userID) REFERENCES datastores(userID) ON DELETE CASCADE, UNIQUE (remoteID, userID))",
		// acl        : "CREATE TABLE IF NOT EXISTS acl (aclID INTEGER PRIMARY KEY AUTOINCREMENT, remoteRowID INTEGER, groupID INTEGER, permID INTEGER, FOREIGN KEY (remoteRowID) REFERENCES remotes(remoteRowID) ON DELETE CASCADE, FOREIGN KEY (groupID) REFERENCES groups(groupID) ON DELETE CASCADE, FOREIGN KEY (permID) REFERENCES permissions(permID) ON DELETE CASCADE, UNIQUE (groupID, permID, remoteRowID))",
		// permissions: "CREATE TABLE IF NOT EXISTS permissions (permID INTEGER PRIMARY KEY AUTOINCREMENT, groupID INTEGER, permission TEXT, dirID INTEGER, path TEXT, isPublic INTEGER, FOREIGN KEY (groupID) REFERENCES groups(groupID) ON DELETE CASCADE, FOREIGN KEY (dirID) REFERENCES dirs(dirID) ON DELETE CASCADE, UNIQUE (groupID, permission, dirID))",
		// groups     : "CREATE TABLE IF NOT EXISTS groups (groupID INTEGER PRIMARY KEY AUTOINCREMENT, groupName TEXT, userID TEXT, FOREIGN KEY (userID) REFERENCES datastores(userID) ON DELETE CASCADE, UNIQUE (groupName, userID))"
	}
}


exports.Database = function(path) {
	var self = this;
	var db = new sql.Database(path);

	//Create tables if not db does not have them
	db.serialize(function() {
		//Foreign keys must be activated
		db.run("PRAGMA foreign_keys = on;");
		db.run(STATEMENTS.create.datastores);
		db.run(STATEMENTS.create.dirs);
		db.run(STATEMENTS.create.files);
		db.run(STATEMENTS.create.remotes);
		db.run(STATEMENTS.create.acl);
		db.run(STATEMENTS.create.permissions);
		db.run(STATEMENTS.create.groups);
	});

	self.getUser = function(){

	};

	self.modifyUser = function(){

	};

	self.getConversationPartnerNames = function(){

	};

	self.getPrivateMessages = function(){

	};

	self.createUser = function(){

	};

	self.createGroup = function(){

	};

	self.checkPass = function(){

	};

	self.enlistIntoGroup = function(){

	};

	self.checkRole = function(){

	};

	self.modifyGroup = function(){

	};

	self.getVideoChannel = function(){

	};

	self.modifyVideoChannel = function(){

	};

	self.createVideoChannel = function(){

	};

	self.deleteVideoChannel = function(){

	};

	self.getTextChannel = function(){

	};

	self.modifyTextChannel = function(){

	};

	self.createTextChannel = function(){

	};

	self.deleteTextChannel = function(){

	};

	self.getAllChannel = function(){

	};

	self.getUser = function(){

	};
};
