import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import {attachWebsocketServer} from "./ws/server.js";
import {securityMiddleware} from "./arcjet.js";

const app = express();
const httpServer = http.createServer(app);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(express.static("public"));




app.use((err, req, res, _next) => {
  const status = err?.statusCode || err?.status || 500;
  const message = status >= 500 ? "Internal Server Error" : err.message;

  if (status >= 500) {
	console.error(err);
  }

  res.status(status).json({ error: message });
});

// app.use(securityMiddleware())


import matchRoutes from "./routes/match.routes.js";



app.use("/api/v1/match", matchRoutes);
import commentaryRoutes from "./routes/commentaryy.routes.js";

app.use("/api/v1/commentary", commentaryRoutes);


const {broadcastMatchesCreated , broadcastCommentary} = attachWebsocketServer(httpServer)
app.locals.broadcastMatchesCreated = broadcastMatchesCreated
app.locals.broadcastCommentary = broadcastCommentary

export default httpServer;

