import app from "./app.js";
import dotenv from "dotenv";
import { connectDb } from "./db/index.js";

dotenv.config({
  path: './.env'
});
const PORT = Number.parseInt(process.env.PORT || "5000");

connectDb()
  .then(() => {
    console.log("Database connected.");

    const server = app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.log(err.message);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database.");
    console.error(err?.message ?? err);
    process.exit(1);
  });
