///<reference path="../typings/main.d.ts" />

'use strict';

import * as async from 'async';
import {expect} from 'chai';
import {Collection, Db, MongoClient} from 'mongodb';
import {Log2pcMongoManager} from '../src/log2pc/Log2pcMongoManager';
import {Log2pcManagerStatus, TaskType} from '../src/log2pc/enums';
import {ILog2pcCreateTask} from '../src/log2pc/ILog2pcModel';

let testDbName = 'test' + Date.now(),
    testConnString = 'mongodb://localhost/' + testDbName,
    transCollName = 'transactions',
    db: Db,
    client: MongoClient;

describe('Log2pcMongoManager connection test', () => {
    it('should connect and disconnect', done => {
        let manager: Log2pcMongoManager;
        async.series([
            callback => manager = new Log2pcMongoManager(testConnString, transCollName, callback),
            callback => {
                expect(manager.status).to.equal(Log2pcManagerStatus.connected);
                callback();
            },
            callback => manager.dispose(callback),
            callback => {
                expect(manager.status).to.equal(Log2pcManagerStatus.disconnected);
                callback();
            }
        ], (err, result) => {
            done();
        });
    });
});

describe('Log2pcMongoManager standard usage test', () => {
    let manager: Log2pcMongoManager,
        client: MongoClient = new MongoClient(),
        db: Db;

    before(done => {
        async.parallel([
            callback => manager = new Log2pcMongoManager(testConnString, transCollName, callback),
            callback => client.connect(testConnString, (err, result) => {
                db = result;
                callback();
            })
        ], done);
    });

    after(done => {
        manager.dispose(done);
    });

    // simple insert
    it('should insert a simple document', done => {
        manager.once('done', () => {
            db.collection('testInsertColl').count({}, (err, result) => {
                expect(result).to.equal(1);
                done();
            })
        });

        manager.runTransaction([
            <ILog2pcCreateTask>{
                type: TaskType.create,
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