module.exports = Schema => {
    const User = sequelize.define({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
    });
    return User;
}; 