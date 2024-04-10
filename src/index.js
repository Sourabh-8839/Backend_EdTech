import dotenv from "dotenv";
import sequelize from "./database/db.js";
import { App } from "./app.js";

//Database Table
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 4000;

sequelize
  .sync()
  .then((res) => {
    console.log("DataBase Connect Succesfully ");
    App.on("error", (err) => {
      console.log(`ERROR RUNNING ON SERVER : ${err.message}`);
    });

    App.listen(port, () => {
      console.log("Server running Succesfully", port);
    });
  })
  .catch((err) => console.error("Unable to connect to the database:", err));
