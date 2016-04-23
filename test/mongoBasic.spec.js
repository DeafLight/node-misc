///<reference path="../typings/async/async.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/mongodb/mongodb.d.ts" />
///<reference path="../typings/mongoose/mongoose.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'async', 'chai', 'mongoose', './enums'], factory);
    }
})(function (require, exports) {
    'use strict';
    var async = require('async');
    var chai_1 = require('chai');
    var mongoose = require('mongoose');
    var enums_1 = require('./enums');
    var testDb = 'test' + Date.now(), testConnString = 'mongodb://localhost/' + testDb, basicTestColl = 'testCollection';
    describe('mongo connection', function () {
        it('should connect and disconnect from default connection', function (done) {
            async.series([
                function (callback) { return mongoose.connect(testConnString, callback); },
                function (callback) {
                    chai_1.expect(mongoose.connection.readyState).to.equal(enums_1.MongooseReadyState.Connected);
                    mongoose.connection.close(callback);
                },
                function (callback) {
                    chai_1.expect(mongoose.connection.readyState).to.equal(enums_1.MongooseReadyState.Disconnected);
                    done();
                    callback();
                }
            ]);
        });
        it('should connect from a specific connection', function (done) {
            var conn;
            async.series([
                function (callback) { return conn = mongoose.createConnection(testConnString)
                    .once('connected', callback); },
                function (callback) {
                    chai_1.expect(conn.readyState).to.equal(enums_1.MongooseReadyState.Connected);
                    callback();
                },
                function (callback) { return conn.close(callback); },
                function (callback) {
                    chai_1.expect(conn.readyState).to.equal(enums_1.MongooseReadyState.Disconnected);
                    done();
                }
            ]);
        });
    });
    describe('mongo basic usage', function () {
        var conn;
        before(function (done) {
            conn = mongoose.createConnection(testConnString)
                .once('connected', done);
        });
        after(function (done) {
            var db = conn.db;
            if ((db.databaseName || '').indexOf('test') >= 0) {
                conn.db.dropDatabase(function () { return conn.close(done); });
            }
            else {
                conn.close(done);
            }
        });
        describe('test connection', function () {
            it('should be connected', function () {
                chai_1.expect(conn.readyState).to.equal(enums_1.MongooseReadyState.Connected);
                chai_1.expect(conn.db.databaseName).to.equal(testDb);
            });
        });
        describe('test simple CRUD operations', function () {
            beforeEach(function (done) {
                var db = conn.db;
                async.series([
                    function (callback) { return db.listCollections({}).toArray(function (err, c) {
                        async.map(c.filter(function (e, i) { return e['name'].indexOf('system.') === -1; }), function (c, callback) {
                            db.collection(c['name']).drop(callback);
                        }, callback);
                    }); },
                    function (callback) { return db.collection(basicTestColl).insertMany([
                        { a: 1 },
                        { a: 2 }
                    ], callback); }
                ], function (err, result) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
            });
            it('should insert a simple object', function (done) {
                var coll = conn.db.collection(basicTestColl);
                async.series({
                    insert: function (callback) { return coll.insertOne({ a: 3 }, callback); },
                    count: function (callback) { return coll.count({}, callback); }
                }, function (err, result) {
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(result['insert'].result.ok).to.equal(1);
                    chai_1.expect(result['insert'].insertedCount).to.equal(1);
                    chai_1.expect(result['count']).to.equal(3);
                    done();
                });
            });
            it('should delete an object', function (done) {
                var coll = conn.db.collection(basicTestColl);
                async.series({
                    delete: function (callback) { return coll.deleteOne({ a: 2 }, callback); },
                    count: function (callback) { return coll.count({}, callback); }
                }, function (err, result) {
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(result['delete'].result.ok).to.equal(1);
                    chai_1.expect(result['delete'].deletedCount).to.equal(1);
                    chai_1.expect(result['count']).to.equal(1);
                    done();
                });
            });
            it('should read an object', function (done) {
                var coll = conn.db.collection(basicTestColl), cursor = coll.find({ a: 1 });
                async.parallel({
                    count: function (callback) { return cursor.count(false, callback); },
                    read: function (callback) { return cursor.next(callback); }
                }, function (err, result) {
                    chai_1.expect(result['count']).to.equal(1);
                    chai_1.expect(result['read'].a).to.equal(1);
                    done();
                });
            });
            it('should update an existing object', function (done) {
                var coll = conn.db.collection(basicTestColl), updatedValue = 45;
                async.series({
                    update: function (callback) { return coll.updateOne({ a: 1 }, { $set: { a: updatedValue } }, callback); },
                    read: function (callback) { return coll.find({ a: updatedValue }).next(callback); }
                }, function (err, result) {
                    chai_1.expect(result['update'].result.ok).to.equal(1);
                    chai_1.expect(result['update'].modifiedCount).to.equal(1);
                    chai_1.expect(result['read'].a).to.equal(updatedValue);
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=mongoBasic.spec.js.map