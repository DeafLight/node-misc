///<reference path="../typings/main.d.ts" />

'use strict';

import * as async from 'async';
import {expect} from 'chai';
import {Db} from 'mongodb';
import * as mongoose from 'mongoose';

let Schema = mongoose.Schema,
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

describe('mongoose basic usage', () => {
    before(done => {
        mongoose.connect(testConnString).connection
            .once('connected', done);
    });

    after(done => {
        let db = <Db>mongoose.connection.db;

        if (((<string>db.databaseName || '').indexOf('test') >= 0)) {
            db.dropDatabase(() => mongoose.connection.close(done));
        } else {
            mongoose.connection.close(done);
        }
    });

    describe('test simple CRUD operations', () => {
        beforeEach(done => {
            let db = <Db>mongoose.connection.db;

            async.series([
                callback => db.listCollections({}).toArray((err, c) => {
                    async.map(c.filter((e, i) => e['name'].indexOf('system.') === -1), (c, callback) => {
                        db.collection(c['name']).drop(callback);
                    }, callback);
                }),
                callback => {
                    async.parallel([
                        callback => new user({
                            name: 'user1',
                            userName: 'user1',
                            password: 'password1'
                        }).save(callback),
                        callback => new user({
                            name: 'user2',
                            userName: 'user2',
                            password: 'password2'
                        }).save(callback)
                    ], callback);
                }
            ], (err, result) => {
                if (err) {
                    throw err;
                }

                done();
            });
        });

        it('should insert a user', done => {
            async.series<any>({
                insert: callback => new user({
                    name: 'user3',
                    userName: 'user3',
                    password: 'password3'
                }).save(callback),
                count: callback => user.count({}, callback)
            }, (err, result) => {
                expect(err).to.equal(null);
                expect(result['insert'][1]).to.equal(1);
                expect(result['insert'][0].errors).to.equal(undefined);
                expect(result['insert'][0]._doc.name).to.equal('user3');
                expect(result['count']).to.equal(3);
                done();
            });
        });

        it('should delete a user', done => {
            async.series<any>({
                delete: callback => user.findOneAndRemove({ name: 'user1' }, callback),
                count: callback => user.count({}, callback)
            }, (err, result) => {
                expect(err).to.equal(null);
                expect(result['delete'].errors).to.equal(undefined);
                expect(result['delete']._doc.name).to.equal('user1');
                expect(result['count']).to.equal(1);
                done();
            });
        });

        it('should read a user', done => {
            user.findOne({ name: 'user1' }, (err, result) => {
                expect(err).to.equal(null);
                expect(result.errors).to.equal(undefined);
                expect(result['_doc'].name).to.equal('user1');
                expect(result['_doc'].password).to.equal('password1');
                done();
            });
        });

        it('should update a user', done => {
            let updatedUserName = 'newUserName';

            async.series<any>({
                update: callback => user.findOneAndUpdate({ name: 'user1' }, { $set: { userName: updatedUserName } }, callback),
                read: callback => user.findOne({ userName: updatedUserName }, callback)
            }, (err, result) => {
                expect(err).to.equal(null);
                expect(result['read'].errors).to.equal(undefined);
                expect(result['read']._doc.name).to.equal('user1');
                expect(result['read']._doc.userName).to.equal(updatedUserName);
                done();
            });

        });
    });
});