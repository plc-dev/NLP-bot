require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const path = require("path");
const cors = require("cors");
const app = express();

(async function main() {
  const port = process.env.PORT || 8088;
  try {
    console.log(`Server has started.`);

		app.use(cors());    
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

    webpush.setVapidDetails(process.env.webpushMail, process.env.publicVapidKey, process.env.privateVapidKey);

    // Set up mongoDB
    const db = await require("./database/database")();

    // Set static path for frontend
    app.use(express.static(path.join(__dirname, "public")));

    const api = require("./api")(express.Router(), db, webpush);
    app.use("/api", api);

  } catch (err) {
    console.log(err);
  } finally {
    require("http")
      .createServer(app)
      .listen(port, () => {
        console.log(`server | http server listening on ${port}`);
      });
  }
})();
