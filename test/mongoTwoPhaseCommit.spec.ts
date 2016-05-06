///<reference path="../typings/main.d.ts" />

'use strict';

// based on http://findnerd.com/list/view/Two-Phase-commits-in-MongoDB/5965/
import * as async from 'async';
import {expect} from 'chai';
import {Collection, Db, MongoClient} from 'mongodb';

interface ITransaction {
    _id: string;
    source: string;
    destination: string;
    value: number;
    state: string;
    lastModified: Date;
}

interface IAccount {
    _id: string; // required: true, unique: true
    balance: number,
    pendingTransactions: Array<string>;
}

let testDbName = 'test' + Date.now(),
    testConnString = 'mongodb://localhost/' + testDbName,
    db: Db,
    client: MongoClient,
    accountColl: Collection,
    transColl: Collection;

describe('two phase commit basic test using mongo', () => {
    before(done => {
        client = new MongoClient();
        client.connect(testConnString, (err, result) => {
            db = result;
            accountColl = <Collection>db.collection('account');
            transColl = <Collection>db.collection('transaction');
            done();
        });
    });

    after(done => {
        if (((<string>db.databaseName || '').indexOf('test') >= 0)) {
            db.dropDatabase(() => db.close(done));
        } else {
            db.close(done);
        }
    });

    describe('test simple two phase commit', () => {
        beforeEach(done => {
            async.series([
                callback => db.listCollections({}).toArray((err, c) => {
                    async.map(c.filter((e, i) => e['name'].indexOf('system.') === -1), (c, callback) => {
                        db.collection(c['name']).drop(callback);
                    }, callback);
                }),
                callback => {
                    accountColl.insertMany(<Array<IAccount>>[
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
            ], (err, result) => {
                if (err) {
                    throw err;
                }

                done();
            });
        });

        it('should perform a simple two phase commit', done => {
            let t: ITransaction;

            async.series([
                // Initialize Transfer Record
                // Insert records to transaction collection to perform transfer of money
                callback => transColl.insertOne({
                    _id: 1,
                    source: 'A',
                    destination: 'B',
                    value: 100,
                    state: 'initial',
                    lastModified: new Date()
                }, callback),
                // Transfer Funds Between Accounts Using Two-Phase Commit
                // 1)Retrieve the transaction to start.
                callback => transColl.findOne({ state: 'initial' }, (err, result) => {
                    t = <ITransaction>result;
                    callback();
                }),
                // 2)Update transaction state to pending.
                callback => transColl.findOneAndUpdate({ _id: t._id, state: 'initial' }, {
                    $set: { state: 'pending' },
                    $currentDate: { lastModified: true }
                }, callback),
                // 3)Apply the transaction to both accounts.
                callback => async.parallel([
                    callback => accountColl.findOneAndUpdate({
                        _id: t.source,
                        pendingTransactions: { $ne: t._id }
                    },
                        {
                            $inc: { balance: -t.value },
                            $push: { pendingTransactions: t._id }
                        }, callback),
                    callback => accountColl.findOneAndUpdate({
                        _id: t.destination,
                        pendingTransactions: { $ne: t._id }
                    },
                        {
                            $inc: { balance: t.value },
                            $push: { pendingTransactions: t._id }
                        }, callback)
                ], callback),
                // 4)Update transaction state to applied
                callback => transColl.findOneAndUpdate({ _id: t._id, state: 'pending' }, {
                    $set: { state: 'applied' },
                    $currentDate: { lastModified: true }
                }, callback),
                // 5)Update both accounts’ list of pending transactions
                callback => async.parallel([
                    callback => accountColl.findOneAndUpdate({
                        _id: t.source,
                        pendingTransactions: t._id
                    },
                        {
                            $pull: { pendingTransactions: t._id }
                        }, callback),
                    callback => accountColl.findOneAndUpdate({
                        _id: t.destination,
                        pendingTransactions: t._id
                    },
                        {
                            $pull: { pendingTransactions: t._id }
                        }, callback)
                ], callback),
                // 6)Update transaction state to done.
                callback => transColl.findOneAndUpdate({ _id: t._id, state: 'applied' }, {
                    $set: { state: 'done' },
                    $currentDate: { lastModified: true }
                }, callback),
            ], (err, result) => {
                async.parallel<any>({
                    count: callback => transColl.count({ state: 'done' }, callback),
                    accountA: callback => accountColl.findOne({ _id: 'A' }, callback),
                    accountB: callback => accountColl.findOne({ _id: 'B' }, callback)
                }, (err, result) => {
                    expect(result['count']).to.equal(1);
                    expect(result['accountA'].balance).to.equal(900);
                    expect(result['accountB'].balance).to.equal(1100);
                    expect(result['accountA'].pendingTransactions.length).to.equal(0);
                    expect(result['accountB'].pendingTransactions.length).to.equal(0);
                    done();
                });
            });
        });
    });
});