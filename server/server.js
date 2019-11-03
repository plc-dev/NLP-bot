require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const path = require('path');
const jwt = require('express-jwt');
const app = express();

(async function main() {
    const port = process.env.PORT || 8080;
    try {
        console.log(`Server has started.`);

        app.use(bodyParser.json({ limit: "50mb" }));
        app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

        // Set up mongoDB
        //const db = require('./database/database');
        const db = {};

        // Set static path for frontend
        app.use(express.static(path.join(__dirname, 'public')));

        // const api = require("./api")(express.Router(), db, webpush);
        // app.use("/api", api);

        webpush.setVapidDetails('mailto:paul.l.christ@web.de', process.env.publicVapidKey, process.env.privateVapidKey);

        // Subscribe Route
        app.post('/subscribe', (req, res) => {
            // Get pushSubscription object
            const subscription = req.body;

            // Send 201 - resource created
            res.status(201).json({});
            console.log(subscription);
            // Create payload
            const payload = JSON.stringify({ title: 'Push Test' });

            // Pass Object into sendNotification
            webpush.sendNotification(subscription, payload).catch(err => console.error(err));
        });

        await require('./bot')({ user: process.env.mockUser, password: process.env.mockPassword });
    } catch (err) {
        console.log(err);
    } finally {
        require('http').createServer(app).listen(port, () => {
            console.log(`server | http server listening on ${port}`);
        });
    }
})();