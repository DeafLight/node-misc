///<reference path="./typings/main/ambient/async/index.d.ts" />
///<reference path="./typings/main/definitions/chai/index.d.ts" />
///<reference path="./typings/main/ambient/mocha/index.d.ts" />
///<reference path="./typings/main/ambient/mongodb/index.d.ts" />
///<reference path="./typings/main/ambient/mongoose/index.d.ts" />

'use strict';

import * as async from 'async';
import {expect} from 'chai';
import {Db} from 'mongodb';
import * as mongoose from 'mongoose';

interface IUser extends mongoose.Schema {
    name: string;
    userName: string;
    password: string;
}

var Schema = mongoose.Schema,
    userSchema = new Schema({
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
    }),
    user = mongoose.model('User', userSchema),
    testDb = 'test' + Date.now(),
    testConnString = 'mongodb://localhost/' + testDb;

class Startup {
    public static main(): number {
        async.series([
            callback => mongoose.connect(testConnString).connection
                .once('connected', callback),
            callback => {
                var u1 = new user({
                    name: 'user1',
                    userName: 'user1',
                    password: 'password1'
                });
                u1.save(callback);
            },
            callback => {
                var db = <Db>mongoose.connection.db;

                if (((<string>db.databaseName || '').indexOf('test') >= 0)) {
                    db.dropDatabase(() => mongoose.connection.close(callback));
                } else {
                    mongoose.connection.close(callback);
                }
            }

        ], (err, result) => {
            if (err) throw err;
            console.log("OK");
        });
        return 0;
    }
}

Startup.main();