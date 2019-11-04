module.exports = mongoose => {
    const User = mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        subscription: {
            type: String
        }
    });
    return mongoose.model("User", User);
}; 