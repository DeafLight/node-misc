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
        define(["require", "exports", 'async', 'chai', 'mongoose'], factory);
    }
})(function (require, exports) {
    'use strict';
    // based on http://findnerd.com/list/view/Two-Phase-commits-in-MongoDB/5965/
    var async = require('async');
    var chai_1 = require('chai');
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema, accountSchema = new Schema({
        _id: { type: String, required: true, unique: true },
        balance: Number,
        pendingTransactions: [String]
    }), account = mongoose.model('Account', accountSchema), transactionSchema = new Schema({
        _id: { type: String, required: true, unique: true },
        source: String,
        destination: String,
        value: Number,
        state: String,
        lastModified: Date
    }), transaction = mongoose.model('Transaction', transactionSchema), testDb = 'test' + Date.now(), testConnString = 'mongodb://localhost/' + testDb;
    describe('two phase commit basic test', function () {
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
        describe('test simple two phase commit', function () {
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
                            function (callback) { return new account({
                                _id: 'A',
                                balance: 1000,
                                pendingTransactions: []
                            }).save(callback); },
                            function (callback) { return new account({
                                _id: 'B',
                                balance: 1000,
                                pendingTransactions: []
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
            it('should perform a simple two phase commit', function (done) {
                var t;
                async.series([
                    // Initialize Transfer Record
                    // Insert records to transaction collection to perform transfer of money
                    function (callback) { return new transaction({
                        _id: 1,
                        source: 'A',
                        destination: 'B',
                        value: 100,
                        state: 'initial',
                        lastModified: new Date()
                    }).save(callback); },
                    // Transfer Funds Between Accounts Using Two-Phase Commit
                    // 1)Retrieve the transaction to start.
                    function (callback) { return transaction.findOne({ state: 'initial' }, function (err, result) {
                        t = result;
                        callback();
                    }); },
                    // 2)Update transaction state to pending.
                    function (callback) { return transaction.findOneAndUpdate({ _id: t._id, state: 'initial' }, {
                        $set: { state: 'pending' },
                        $currentDate: { lastModified: true }
                    }, callback); },
                    // 3)Apply the transaction to both accounts.
                    function (callback) { return async.parallel([
                        function (callback) { return account.findOneAndUpdate({
                            _id: t.source,
                            pendingTransactions: { $ne: t._id }
                        }, {
                            $inc: { balance: -t.value },
                            $push: { pendingTransactions: t._id }
                        }, callback); },
                        function (callback) { return account.findOneAndUpdate({
                            _id: t.destination,
                            pendingTransactions: { $ne: t._id }
                        }, {
                            $inc: { balance: t.value },
                            $push: { pendingTransactions: t._id }
                        }, callback); }
                    ], callback); },
                    // 4)Update transaction state to applied
                    function (callback) { return transaction.findOneAndUpdate({ _id: t._id, state: 'pending' }, {
                        $set: { state: 'applied' },
                        $currentDate: { lastModified: true }
                    }, callback); },
                    // 5)Update both accounts’ list of pending transactions
                    function (callback) { return async.parallel([
                        function (callback) { return account.findOneAndUpdate({
                            _id: t.source,
                            pendingTransactions: t._id
                        }, {
                            $pull: { pendingTransactions: t._id }
                        }, callback); },
                        function (callback) { return account.findOneAndUpdate({
                            _id: t.destination,
                            pendingTransactions: t._id
                        }, {
                            $pull: { pendingTransactions: t._id }
                        }, callback); }
                    ], callback); },
                    // 6)Update transaction state to done.
                    function (callback) { return transaction.findOneAndUpdate({ _id: t._id, state: 'applied' }, {
                        $set: { state: 'done' },
                        $currentDate: { lastModified: true }
                    }, callback); },
                ], function (err, result) {
                    async.parallel({
                        count: function (callback) { return transaction.count({ state: 'done' }, callback); },
                        accountA: function (callback) { return account.findOne({ _id: 'A' }, callback); },
                        accountB: function (callback) { return account.findOne({ _id: 'B' }, callback); }
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
//# sourceMappingURL=twoPhaseCommit.spec.js.map