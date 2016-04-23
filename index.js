///<reference path="typings/async/async.d.ts" />
///<reference path="typings/chai/chai.d.ts" />
///<reference path="typings/mocha/mocha.d.ts" />
///<reference path="typings/mongodb/mongodb.d.ts" />
///<reference path="typings/mongoose/mongoose.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'async', 'mongoose'], factory);
    }
})(function (require, exports) {
    "use strict";
    var async = require('async');
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema, userSchema = new Schema({
        name: String,
        userName: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        admin: Boolean,
        location: String,
        meta: {
            age: Number,
            website: String
        },
        createdAt: Date,
        updateAt: Date
    }), user = mongoose.model('User', userSchema), testDb = 'test' + Date.now(), testConnString = 'mongodb://localhost/' + testDb;
    var Startup = (function () {
        function Startup() {
        }
        Startup.main = function () {
            async.series([
                function (callback) { return mongoose.connect(testConnString).connection
                    .once('connected', callback); },
                function (callback) {
                    var u1 = new user({
                        name: 'user1',
                        userName: 'user1',
                        password: 'password1'
                    });
                    u1.save(callback);
                },
                function (callback) {
                    var db = mongoose.connection.db;
                    if (((db.databaseName || '').indexOf('test') >= 0)) {
                        db.dropDatabase(function () { return mongoose.connection.close(callback); });
                    }
                    else {
                        mongoose.connection.close(callback);
                    }
                }
            ], function (err, result) {
                if (err)
                    throw err;
                console.log("OK");
            });
            return 0;
        };
        return Startup;
    }());
    Startup.main();
});
//# sourceMappingURL=index.js.map