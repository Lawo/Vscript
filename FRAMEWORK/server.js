const express = require("express");
const app = express();
const path = require("path");
const cardSetup = new(require("./cardSetup"))();

const port = 3000;

app.use(express.static(path.join(__dirname, "routing")));

app.use(express.json());

let ws_connection;
let status_callback = function(status) {
	ws_connection.send(status);
};

app.post("/configure", async function(req, res) {
	console.log(JSON.stringify(req.body, null, 2));
	try {
		req.body.status = status_callback;
		cardSetup.complete_setup(req.body);
	} catch (error) {
		console.log(error);
	} 
	res.sendStatus(200);
});

app.listen(port, (err) => {
	if (err) {
		return console.log("something bad happened", err);
	}

	console.log(`server is listening on ${port}`);
});

var WebSocketServer = require("ws").Server,
	wss = new WebSocketServer({port: 40510});
wss.on("connection", function (ws) {
	ws_connection = ws;
	ws.on("message", function (message) {
		console.log("received: %s", message);
	});
});