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
    // based on http://findnerd.com/list/view/Two-Phase-commits-in-MongoDB/5965/
    var async = require('async');
    var chai_1 = require('chai');
    var mongodb_1 = require('mongodb');
    var testDbName = 'test' + Date.now(), testConnString = 'mongodb://localhost/' + testDbName, db, client, accountColl, transColl;
    describe('two phase commit basic test using mongo', function () {
        before(function (done) {
            client = new mongodb_1.MongoClient();
            client.connect(testConnString, function (err, result) {
                db = result;
                accountColl = db.collection('account');
                transColl = db.collection('transaction');
                done();
            });
        });
        after(function (done) {
            if (((db.databaseName || '').indexOf('test') >= 0)) {
                db.dropDatabase(function () { return db.close(done); });
            }
            else {
                db.close(done);
            }
        });
        describe('test simple two phase commit', function () {
            beforeEach(function (done) {
                async.series([
                    function (callback) { return db.listCollections({}).toArray(function (err, c) {
                        async.map(c.filter(function (e, i) { return e['name'].indexOf('system.') === -1; }), function (c, callback) {
                            db.collection(c['name']).drop(callback);
                        }, callback);
                    }); },
                    function (callback) {
                        accountColl.insertMany([
                            {
                                _id: 'A',
                                balance: 1000,
                                pendingTransactions: []
                            }, {
                                _id: 'B',
                                balance: 1000,
                                pendingTransactions: []
                            }], callback);
                    }
                ], function (err, result) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
            });
            it('should perform a simple two phase commit', function (done) {
                var t;
                async.series([
                    // Initialize Transfer Record
                    // Insert records to transaction collection to perform transfer of money
                    function (callback) { return transColl.insertOne({
                        _id: 1,
                        source: 'A',
                        destination: 'B',
                        value: 100,
                        state: 'initial',
                        lastModified: new Date()
                    }, callback); },
                    // Transfer Funds Between Accounts Using Two-Phase Commit
                    // 1)Retrieve the transaction to start.
                    function (callback) { return transColl.findOne({ state: 'initial' }, function (err, result) {
                        t = result;
                        callback();
                    }); },
                    // 2)Update transaction state to pending.
                    function (callback) { return transColl.findOneAndUpdate({ _id: t._id, state: 'initial' }, {
                        $set: { state: 'pending' },
                        $currentDate: { lastModified: true }
                    }, callback); },
                    // 3)Apply the transaction to both accounts.
                    function (callback) { return async.parallel([
                        function (callback) { return accountColl.findOneAndUpdate({
                            _id: t.source,
                            pendingTransactions: { $ne: t._id }
                        }, {
                            $inc: { balance: -t.value },
                            $push: { pendingTransactions: t._id }
                        }, callback); },
                        function (callback) { return accountColl.findOneAndUpdate({
                            _id: t.destination,
                            pendingTransactions: { $ne: t._id }
                        }, {
                            $inc: { balance: t.value },
                            $push: { pendingTransactions: t._id }
                        }, callback); }
                    ], callback); },
                    // 4)Update transaction state to applied
                    function (callback) { return transColl.findOneAndUpdate({ _id: t._id, state: 'pending' }, {
                        $set: { state: 'applied' },
                        $currentDate: { lastModified: true }
                    }, callback); },
                    // 5)Update both accounts’ list of pending transactions
                    function (callback) { return async.parallel([
                        function (callback) { return accountColl.findOneAndUpdate({
                            _id: t.source,
                            pendingTransactions: t._id
                        }, {
                            $pull: { pendingTransactions: t._id }
                        }, callback); },
                        function (callback) { return accountColl.findOneAndUpdate({
                            _id: t.destination,
                            pendingTransactions: t._id
                        }, {
                            $pull: { pendingTransactions: t._id }
                        }, callback); }
                    ], callback); },
                    // 6)Update transaction state to done.
                    function (callback) { return transColl.findOneAndUpdate({ _id: t._id, state: 'applied' }, {
                        $set: { state: 'done' },
                        $currentDate: { lastModified: true }
                    }, callback); },
                ], function (err, result) {
                    async.parallel({
                        count: function (callback) { return transColl.count({ state: 'done' }, callback); },
                        accountA: function (callback) { return accountColl.findOne({ _id: 'A' }, callback); },
                        accountB: function (callback) { return accountColl.findOne({ _id: 'B' }, callback); }
                    }, function (err, result) {
                        chai_1.expect(result['count']).to.equal(1);
                        chai_1.expect(result['accountA'].balance).to.equal(900);
                        chai_1.expect(result['accountB'].balance).to.equal(1100);
                        chai_1.expect(result['accountA'].pendingTransactions.length).to.equal(0);
                        chai_1.expect(result['accountB'].pendingTransactions.length).to.equal(0);
                        done();
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=mongoTwoPhaseCommit.spec.js.map