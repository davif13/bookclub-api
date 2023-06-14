import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import db from "./src/models";
import UserController from "./src/controllers/user";
const app = express();
app.use(express.json());
const port = 3333;

app.post("/", UserController.create);
app.post("/login", UserController.login);

app.listen(port, async () => {
  try {
    await db.sequelize.authenticate();
    console.log("App running and DB connected");
  } catch (error) {
    console.log(error);
    console.log("Error running app");
  }
});
