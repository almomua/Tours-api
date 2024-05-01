const mongoose = require('mongoose');
exports.connection = async () => {
    try {
        const DB = process.env.DATABASE_URL.replace(
            '<PASSWORD>',
            process.env.PASSWORD,
        );
        await mongoose.connect(DB);
        console.log('DB connection successful');
    } catch (err) {
        console.log(err);
    }
};
