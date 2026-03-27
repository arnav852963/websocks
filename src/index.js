import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: './.env'
});
const PORT = Number.parseInt(process.env.PORT || "3000", 10);


app.listen(PORT,  () => {
  console.log(`Listening on port ${PORT}`);

  app.on("error" , (err) => {
    console.log(err.message);
  })
});
