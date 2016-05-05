///<reference path="../typings/main.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'async', 'chai', 'mongodb'], factory);
    }
})(function (require, exports) {
    'use strict';
    var async = require('async');
    var chai_1 = require('chai');
    var mongodb_1 = require('mongodb');
    var testDb = 'test' + Date.now(), testConnString = 'mongodb://localhost/' + testDb, basicTestColl = 'testCollection';
    describe('mongo connection', function () {
        it('should connect and disconnect from default connection', function (done) {
            var client = new mongodb_1.MongoClient(), db;
            async.series([
                function (callback) { return client.connect(testConnString, function (err, result) {
                    db = result;
                    callback();
                }); },
                function (callback) {
                    chai_1.expect(db).to.exist;
                    db.close(callback);
                },
                function (callback) {
                    done();
                    callback();
                }
            ]);
        });
        describe('mongo basic usage', function () {
            var client = new mongodb_1.MongoClient(), db;
            before(function (done) {
                client.connect(testConnString, function (err, result) {
                    db = result;
                    done();
                });
            });
            after(function (done) {
                if ((db.databaseName || '').indexOf('test') >= 0) {
                    db.dropDatabase(function () { return db.close(done); });
                }
                else {
                    db.close(done);
                }
            });
            describe('test connection', function () {
                it('should be connected', function () {
                    chai_1.expect(db).to.exist;
                    chai_1.expect(db.databaseName).to.equal(testDb);
                });
            });
            describe('test simple CRUD operations', function () {
                beforeEach(function (done) {
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
                    var coll = db.collection(basicTestColl);
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
                    var coll = db.collection(basicTestColl);
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
                    var coll = db.collection(basicTestColl), cursor = coll.find({ a: 1 });
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
                    var coll = db.collection(basicTestColl), updatedValue = 45;
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
});
//# sourceMappingURL=mongoBasic.spec.js.map