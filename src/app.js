import express from "express";
import cookieParser from "cookie-parser";

const app = express();

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






export default app;

