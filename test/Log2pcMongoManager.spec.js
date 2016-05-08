///<reference path="../typings/main.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'async', 'chai', 'mongodb', '../src/log2pc/Log2pcMongoManager', '../src/log2pc/enums'], factory);
    }
})(function (require, exports) {
    'use strict';
    var async = require('async');
    var chai_1 = require('chai');
    var mongodb_1 = require('mongodb');
    var Log2pcMongoManager_1 = require('../src/log2pc/Log2pcMongoManager');
    var enums_1 = require('../src/log2pc/enums');
    var testDbName = 'test' + Date.now(), testConnString = 'mongodb://localhost/' + testDbName, transCollName = 'transactions', db, client;
    describe('Log2pcMongoManager connection test', function () {
        it('should connect and disconnect', function (done) {
            var manager;
            async.series([
                function (callback) { return manager = new Log2pcMongoManager_1.Log2pcMongoManager(testConnString, transCollName, callback); },
                function (callback) {
                    chai_1.expect(manager.status).to.equal(enums_1.Log2pcManagerStatus.connected);
                    callback();
                },
                function (callback) { return manager.dispose(callback); },
                function (callback) {
                    chai_1.expect(manager.status).to.equal(enums_1.Log2pcManagerStatus.disconnected);
                    callback();
                }
            ], function (err, result) {
                done();
            });
        });
    });
    describe('Log2pcMongoManager standard usage test', function () {
        var manager, client = new mongodb_1.MongoClient(), db;
        before(function (done) {
            async.parallel([
                function (callback) { return manager = new Log2pcMongoManager_1.Log2pcMongoManager(testConnString, transCollName, callback); },
                function (callback) { return client.connect(testConnString, function (err, result) {
                    db = result;
                    callback();
                }); }
            ], done);
        });
        after(function (done) {
            manager.dispose(done);
        });
        // simple insert
        it('should insert a simple document', function (done) {
            manager.once('done', function () {
                db.collection('testInsertColl').count({}, function (err, result) {
                    chai_1.expect(result).to.equal(1);
                    done();
                });
            });
            manager.runTransaction([
                {
                    type: enums_1.TaskType.create,
                    model: 'testInsertColl',
                    val: {
                        name: 'testInsert'
                    }
                }
            ]);
        });
        // multi doc insert
        // simple update
        // multi doc update
        // simple delete
        // multi doc delete
        // heterogenous transaction
        // simple rollback
        // multidoc rollback
    });
});
//# sourceMappingURL=Log2pcMongoManager.spec.js.map