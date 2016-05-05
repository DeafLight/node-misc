///<reference path="../typings/main.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'async', 'chai', 'mongoose'], factory);
    }
})(function (require, exports) {
    'use strict';
    var async = require('async');
    var chai_1 = require('chai');
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
    describe('mongoose basic usage', function () {
        before(function (done) {
            mongoose.connect(testConnString).connection
                .once('connected', done);
        });
        after(function (done) {
            var db = mongoose.connection.db;
            if (((db.databaseName || '').indexOf('test') >= 0)) {
                db.dropDatabase(function () { return mongoose.connection.close(done); });
            }
            else {
                mongoose.connection.close(done);
            }
        });
        describe('test simple CRUD operations', function () {
            beforeEach(function (done) {
                var db = mongoose.connection.db;
                async.series([
                    function (callback) { return db.listCollections({}).toArray(function (err, c) {
                        async.map(c.filter(function (e, i) { return e['name'].indexOf('system.') === -1; }), function (c, callback) {
                            db.collection(c['name']).drop(callback);
                        }, callback);
                    }); },
                    function (callback) {
                        async.parallel([
                            function (callback) { return new user({
                                name: 'user1',
                                userName: 'user1',
                                password: 'password1'
                            }).save(callback); },
                            function (callback) { return new user({
                                name: 'user2',
                                userName: 'user2',
                                password: 'password2'
                            }).save(callback); }
                        ], callback);
                    }
                ], function (err, result) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
            });
            it('should insert a user', function (done) {
                async.series({
                    insert: function (callback) { return new user({
                        name: 'user3',
                        userName: 'user3',
                        password: 'password3'
                    }).save(callback); },
                    count: function (callback) { return user.count({}, callback); }
                }, function (err, result) {
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(result['insert'][1]).to.equal(1);
                    chai_1.expect(result['insert'][0].errors).to.equal(undefined);
                    chai_1.expect(result['insert'][0]._doc.name).to.equal('user3');
                    chai_1.expect(result['count']).to.equal(3);
                    done();
                });
            });
            it('should delete a user', function (done) {
                async.series({
                    delete: function (callback) { return user.findOneAndRemove({ name: 'user1' }, callback); },
                    count: function (callback) { return user.count({}, callback); }
                }, function (err, result) {
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(result['delete'].errors).to.equal(undefined);
                    chai_1.expect(result['delete']._doc.name).to.equal('user1');
                    chai_1.expect(result['count']).to.equal(1);
                    done();
                });
            });
            it('should read a user', function (done) {
                user.findOne({ name: 'user1' }, function (err, result) {
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(result.errors).to.equal(undefined);
                    chai_1.expect(result['_doc'].name).to.equal('user1');
                    chai_1.expect(result['_doc'].password).to.equal('password1');
                    done();
                });
            });
            it('should update a user', function (done) {
                var updatedUserName = 'newUserName';
                async.series({
                    update: function (callback) { return user.findOneAndUpdate({ name: 'user1' }, { $set: { userName: updatedUserName } }, callback); },
                    read: function (callback) { return user.findOne({ userName: updatedUserName }, callback); }
                }, function (err, result) {
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(result['read'].errors).to.equal(undefined);
                    chai_1.expect(result['read']._doc.name).to.equal('user1');
                    chai_1.expect(result['read']._doc.userName).to.equal(updatedUserName);
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=mongooseBasic.spec.js.map