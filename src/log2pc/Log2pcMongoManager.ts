///<reference path="../../typings/main.d.ts" />
///<reference path="../typings/IDisposable.d.ts" />

'use strict';

import {Collection, Db, MongoClient} from 'mongodb';
import {Log2pcManagerStatus, TaskType} from './enums';
import {EventEmitter} from 'events';
import {ILog2pcTask, ILog2pcCreateTask} from './ILog2pcModel';

export class Log2pcMongoManager extends EventEmitter implements IDisposable {
    protected _db: Db;
    protected _transactionCollection: Collection;
    protected _status: Log2pcManagerStatus;
    constructor(connectionString: string, transactionCollection: string, callback?: (err: Error, result: any) => void) {
        super();
        this._status = Log2pcManagerStatus.connecting;
        new MongoClient().connect(connectionString, (err, result) => {
            this._db = result;
            this._transactionCollection = <Collection>this._db.collection(transactionCollection);
            this._status = Log2pcManagerStatus.connected;
            callback && callback(err, result);
        });
    }

    public runTransaction(tasks: Array<ILog2pcTask>, callback?: (err: Error, result: any) => void) {
        if (!tasks) {
            // TODO : ?
            throw 'not implemented';
        }

        if (tasks.length === 1) {
            let task = tasks[0];

            switch (task.type) {
                case TaskType.create:
                    let createTask = <ILog2pcCreateTask>task;
                    this._db.collection(createTask.model).insert(createTask.val, (err, result) => this.emit('done'));
                    break;
                default:
                    // TODO : deal with other types
                    throw 'not implemented';
            }
        } else {
            // TODO : 2 phase commit
            throw 'not implemented';
        }
    }

    public dispose(callback?: (err: Error, result: any) => void) {
        this._status = Log2pcManagerStatus.disconnecting;
        this._db.close((err, result) => {
            this._status = Log2pcManagerStatus.disconnected;
            callback && callback(err, result);
        });
    }

    public get status() { return this._status; }
    public get db() { return this._db; }
    public get transactionCollection() { return this._transactionCollection; }
}