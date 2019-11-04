module.exports = (router, db, webpush) => {
    const jwt = require('jsonwebtoken');
    const signOptions = { expiresIn: "24h" };
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
    // Authenticate with JWT
    router.post("/auth", (req, res) => {
        const parsedAuth = JSON.parse(req.body.body);
        const user = parsedAuth.user;
        const password = parsedAuth.password;
        if (user === config.user && config.pass === password) {
            jwt.sign({ user }, config.privateKey, signOptions, (err, token) => {
                res.json({
                    token
                });
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
        console.log(subscription);
        // Create payload
        const payload = JSON.stringify({ title: 'Push Test' });

        // Pass Object into sendNotification
        webpush.sendNotification(subscription, payload).catch(err => console.error(err));
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

    return router;
};