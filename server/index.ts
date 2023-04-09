import express from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";

const app = express();

const jsonParser = bodyParser.json();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

app.post("/webhook", jsonParser, (req, res) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "notification",
          title: req.body.data.title,
          message: req.body.data.message,
        })
      );
    }
  });
  console.log("webhook called", req);
  res.sendStatus(200);
});

wss.on("connection", (ws: WebSocket) => {
  //connection is up, let's add a simple simple event
  ws.on("message", (message: string) => {
    //log the received message and send it back to the client
    console.log("received: %s", message);
    ws.send(`Hello, you sent -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");
});

const port = process.env.PORT || 8999;

//start our server
server.listen(port, () => {
  console.log(`Server started on port ${port} :)`);
});
