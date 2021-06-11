const mongoose = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            autoIndex: false,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        };
        const uri = process.env.MONGODB;
        mongoose.connect(uri, dbOptions).catch(err => console.log(err.reason));
        mongoose.set('useFindAndModify', false);
        mongoose.set('useUnifiedTopology', true);
        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connection successfully opened!');
        });

        mongoose.connection.on('err', err => {
            console.error(`Mongoose connection error: \n ${err.stack}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose connection disconnected');
        });
    }
};