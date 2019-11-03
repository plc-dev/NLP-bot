module.exports = async () => {
    try {
        const mongoose = require('mongoose');
        const Schema = mongoose.Schema;

        // Setup Connection
        mongoose.connect(process.env.mongooseConnection);

        // Add all models to one object for better accessibility
        const db = {};
        db.Expense = require('./model/Expense')(Schema);
        db.User = require('./model/User')(Schema);

        Object.keys(db).forEach(model => {
            mongoose.model(model, db[model]);
        });

        db.mongoose = mongoose;

        console.log(`Tables have been initialized!`);

        return db;
    } catch (err) {
        console.log(err);
    }
};