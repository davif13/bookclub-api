import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import db from "./src/models";
import routes from "./src/routes";
const app = express();
const port = 3333;
app.use(express.json());
app.use(routes);

app.listen(port, async () => {
  try {
    await db.sequelize.authenticate();
    console.log("App running and DB connected");
  } catch (error) {
    console.log(error);
    console.log("Error running app");
  }
});
