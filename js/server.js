/* Magic Mirror
 * Server
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var path = require("path");
var ipfilter = require("express-ipfilter").IpFilter;
var fs = require("fs");
var helmet = require("helmet");

var Server = function(config, callback) {
	console.log("Starting server on port " + config.port + " ... ");

	var port = config.port;
	if (process.env.MM_PORT) {
		port = process.env.MM_PORT;
	}

	console.log("Starting server op port " + port + " ... ");

	server.listen(port, config.address ? config.address : null);

	if (config.ipWhitelist instanceof Array && config.ipWhitelist.length == 0) {
		console.info("You're using a full whitelist configuration to allow for all IPs")
	}

	app.use(function(req, res, next) {
		var result = ipfilter(config.ipWhitelist, {mode: "allow", log: false})(req, res, function(err) {
			if (err === undefined) {
				return next();
			}
			console.log(err.message);
			res.status(403).send("This device is not allowed to access your mirror. <br> Please check your config.js or config.js.sample to change this.");
		});
	});
	app.use(helmet());

	app.use("/js", express.static(__dirname));
	var directories = ["/config", "/css", "/fonts", "/modules", "/vendor", "/translations", "/tests/configs"];
	var directory;
	for (i in directories) {
		directory = directories[i];
		app.use(directory, express.static(path.resolve(global.root_path + directory)));
	}

	app.get("/version", function(req,res) {
		res.send(global.version);
	});

	app.get("/", function(req, res) {
		var html = fs.readFileSync(path.resolve(global.root_path + "/index.html"), {encoding: "utf8"});
		html = html.replace("#VERSION#", global.version);

		configFile = "config/config.js";
		if (typeof(global.configuration_file) !== "undefined") {
		    configFile = global.configuration_file;
		}
		html = html.replace("#CONFIG_FILE#", configFile);

		res.send(html);
	});

	var dir = path.join(__dirname, '../public');
	var mime = {
	    html: 'text/html',
	    txt: 'text/plain',
	    css: 'text/css',
	    gif: 'image/gif',
	    jpg: 'image/jpeg',
	    png: 'image/png',
	    svg: 'image/svg+xml',
	    js: 'application/javascript'
	};

	app.get('*', function (req, res) {
	    var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
	    if (file.indexOf(dir + path.sep) !== 0) {
	        return res.status(403).end('Forbidden');
	    }
	    var type = mime[path.extname(file).slice(1)] || 'text/plain';
	    var s = fs.createReadStream(file);
	    s.on('open', function () {
	        res.set('Content-Type', type);
	        s.pipe(res);
	    });
	    s.on('error', function () {
	        res.set('Content-Type', 'text/plain');
	        res.status(404).end('Not found');
	    });
	});

	if (typeof callback === "function") {
		callback(app, io);
	}
};

module.exports = Server;
