"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto_1 = require("crypto");
const app = (0, express_1.default)();
const jsonParser = body_parser_1.default.json();
//initialize a simple http server
const server = http_1.default.createServer(app);
//initialize the WebSocket server instance
const wss = new ws_1.default.Server({ server });
app.post("/webhook", jsonParser, (req, res) => {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify({
                id: (0, crypto_1.randomUUID)(),
                type: "notification",
                data: {
                    title: req.body.data.title,
                    message: req.body.data.message,
                    intent: req.body.data.intent,
                },
            }));
        }
    });
    res.sendStatus(200);
});
wss.on("connection", (ws) => {
    // Acknowledge connection
    ws.send(JSON.stringify({ id: (0, crypto_1.randomUUID)(), type: "connection", data: null }));
});
const port = process.env.PORT || 8999;
//start our server
server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
//# sourceMappingURL=index.js.map