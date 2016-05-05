///<reference path="../typings/main.d.ts" />

'use strict';

import * as async from 'async';
import {expect} from 'chai';
import {Collection, Cursor, Db, MongoClient, Server, MongoCallback} from 'mongodb';
import {MongooseReadyState} from './enums';

let testDb = 'test' + Date.now(),
    testConnString = 'mongodb://localhost/' + testDb,
    basicTestColl = 'testCollection';

describe('mongo connection', () => {
    it('should connect and disconnect from default connection', done => {
        let client: MongoClient = new MongoClient(),
            db: Db;
        async.series([
            callback => client.connect(testConnString, (err, result) => {
                db = result;
                callback();
            }),
            callback => {
                expect(db).to.exist;
                db.close(<MongoCallback<any>>callback);
            },
            callback => {
                done();
                callback();
            }
        ]);
    });

    describe('mongo basic usage', () => {
        let client: MongoClient = new MongoClient(),
            db: Db;

        before(done => {
            client.connect(testConnString, (err, result) => {
                db = result;
                done();
            })
        });

        after(done => {
            if ((<string>db.databaseName || '').indexOf('test') >= 0) {
                db.dropDatabase(() => db.close(done));
            } else {
                db.close(done);
            }
        });

        describe('test connection', () => {
            it('should be connected', () => {
                expect(db).to.exist;
                expect(db.databaseName).to.equal(testDb);
            });
        });

        describe('test simple CRUD operations', () => {
            beforeEach(done => {
                async.series([
                    callback => db.listCollections({}).toArray((err, c) => {
                        async.map(c.filter((e, i) => e['name'].indexOf('system.') === -1), (c, callback) => {
                            db.collection(c['name']).drop(callback);
                        }, callback);
                    }),
                    callback => db.collection(basicTestColl).insertMany([
                        { a: 1 },
                        { a: 2 }
                    ], callback)
                ], (err, result) => {
                    if (err) {
                        throw err;
                    }

                    done();
                });
            });

            it('should insert a simple object', done => {
                let coll = <Collection>db.collection(basicTestColl);

                async.series<any>({
                    insert: callback => coll.insertOne({ a: 3 }, callback),
                    count: callback => coll.count({}, callback)
                }, (err, result) => {
                    expect(err).to.equal(null);
                    expect(result['insert'].result.ok).to.equal(1);
                    expect(result['insert'].insertedCount).to.equal(1);
                    expect(result['count']).to.equal(3);
                    done();
                });
            });

            it('should delete an object', done => {
                let coll = <Collection>db.collection(basicTestColl);

                async.series<any>({
                    delete: callback => coll.deleteOne({ a: 2 }, callback),
                    count: callback => coll.count({}, callback)
                }, (err, result) => {
                    expect(err).to.equal(null);
                    expect(result['delete'].result.ok).to.equal(1);
                    expect(result['delete'].deletedCount).to.equal(1);
                    expect(result['count']).to.equal(1);
                    done();
                });
            });

            it('should read an object', done => {
                let coll = <Collection>db.collection(basicTestColl),
                    cursor = coll.find({ a: 1 });

                async.parallel<any>({
                    count: callback => cursor.count(false, callback),
                    read: callback => cursor.next(callback)
                }, (err, result) => {
                    expect(result['count']).to.equal(1);
                    expect(result['read'].a).to.equal(1);
                    done();
                });
            });

            it('should update an existing object', done => {
                let coll = <Collection>db.collection(basicTestColl),
                    updatedValue = 45;

                async.series<any>({
                    update: callback => coll.updateOne({ a: 1 }, { $set: { a: updatedValue } }, callback),
                    read: callback => coll.find({ a: updatedValue }).next(callback)
                }, (err, result) => {
                    expect(result['update'].result.ok).to.equal(1);
                    expect(result['update'].modifiedCount).to.equal(1);
                    expect(result['read'].a).to.equal(updatedValue);
                    done();
                });
            });
        });
    });
});