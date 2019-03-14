const express = require("express");
const app = express();
const path = require("path");
const cardSetup = new(require("./cardSetup"))();
const ReadOut = require("./routing/readOut");

const port = 3000;

app.use(express.static(path.join(__dirname, "routing")));

app.use(express.json());

let wsConnection;
let statusCallback = function(status) {
	wsConnection.send(status);
};

let cardReader = new ReadOut.CardReader();


app.post("/configure", async function(req, res) {
	console.log(JSON.stringify(req.body, null, 2));
	try {
		req.body.status = statusCallback;
		cardSetup.complete_setup(req.body);
	} catch (error) {
		console.log(error);
	} 
	res.sendStatus(200);
});

app.post("/readout", async function(req, res) {
	console.log(req.body);
	try {
		cardReader.readCard(req.body.ip).then((result) => {
			console.log(JSON.stringify(result, null, 2));
		});
	} catch (error) {
		console.log(error);
	}
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
	wsConnection = ws;
	ws.on("message", function (message) {
		console.log("received: %s", message);
	});
});
