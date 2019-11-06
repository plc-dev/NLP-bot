module.exports = (router, db, webpush) => {
    const jwt = require('jsonwebtoken');
    const signOptions = { expiresIn: "24h" };
    const nodemailer = require('nodemailer');
    const { User } = db.models;

    /**
     * JWT verification 
     * @param {HTTP request} req 
     * @param {HTTP response} res 
     * @param {function} next 
     */
    const verifyToken = (req, res, next) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(' ')[1];
            req.token = bearerToken;
            next();
        } else {
            res.sendStatus(403);
        }
    };

    // verify Token in frontend
    router.post("/verify", (req, res) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(' ')[1];
            req.token = bearerToken;
            res.send({ verified: true });
        } else {
            res.send({ verified: false });
        }
    });

    // Authenticate with JWT
    router.post("/auth", (req, res) => {
        const parsedAuth = JSON.parse(req.body.body);
        const user = parsedAuth.user;
        const password = parsedAuth.password;
        if (user === '' && ''  === password) {
            jwt.sign({ user }, config.privateKey, signOptions, (err, token) => {
                res.json({ token });
            });
        } else {
            res.sendStatus(403);
        }
    });

    // Subscribe Route
    router.post('/subscribe', (req, res) => {
        // Get pushSubscription object
        const subscription = req.body;
        // Send 201 - resource created
        res.status(201).json({});
        // Create payload
        const payload = JSON.stringify({ title: 'Subscription', message: 'Subscription successfully setup' });
        // Pass Object into sendNotification
        webpush.sendNotification(subscription, payload).catch(err => console.error(err));
        // Persists subscription to db
    });

    // Get unrated visitors
    router.get("/overview", verifyToken, (req, res) => {
        jwt.verify(req.token, config.privateKey, signOptions, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const visitors = DataCache.getUnrated(15);
                res.json(visitors);
            }
        });
    });

    // trigger bot
    router.get("/startBot", (req, res) => {
        const credentials = req.body;
        res.sendStatus(200);
        require('./bot')(credentials, nodemailer);
    });

    return router;
};