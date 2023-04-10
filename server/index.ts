import express from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";
import { randomUUID } from "crypto";

// Create a new express app instance
const app = express();

// Parse JSON bodies
const jsonParser = bodyParser.json();

// Create a new HTTP server
const server = http.createServer(app);

// Create a new WebSocket server
const wss = new WebSocket.Server({ server });

app.post("/webhook", jsonParser, (req, res) => {
  // Broadcast the notification to all connected clients
  // In a real app, you would probably want to send to specific clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          id: randomUUID(), // Generate a random ID for the message
          type: "notification", // Give the message a type
          // Encode the data from the webhook into the message
          data: {
            title: req.body.data.title,
            message: req.body.data.message,
            intent: req.body.data.intent,
          },
        })
      );
    }
  });
  res.sendStatus(200);
});

// Handle new WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  // Acknowledge connection
  ws.send(JSON.stringify({ id: randomUUID(), type: "connection", data: null }));
});

const port = process.env.PORT || 8999;

// Start the server
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
