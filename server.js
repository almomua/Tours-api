const {connection} = require('./DBconnect');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const app = require('./app');
const port = process.env.PORT || 3000;
connection()
app.listen(port, '127.0.0.1', () => {
    console.log('app is listening on port ' + port);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
}
);
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

