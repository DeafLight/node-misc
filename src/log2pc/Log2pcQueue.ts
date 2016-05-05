///<reference path="../../typings/main.d.ts" />

'use strict';

import * as async from 'async';
import {EventEmitter} from 'events';
import {QueueStatus} from './enums';
import {ILog2pcQueue, ILog2pcTransaction, ILog2pcTask} from './ILog2pcModel';

export class Log2pcQueue extends EventEmitter implements ILog2pcQueue {
    protected queue: AsyncQueue<ILog2pcTransaction>;

    constructor(connString: string) {
        super();
        this.queue = async.queue<ILog2pcTransaction>(this.save);
    }

    private save(task: ILog2pcTransaction, callback) {
        callback();
    }

    public add(transaction: ILog2pcTransaction): void {
        this.queue.push(transaction);
    }

    public isEmpty() {
        return this.queue.length() + this.queue.running() === 0;
    }

    public status() {
        if (this.queue.idle() || this.queue.running() === 0) {
            return QueueStatus.ready;
        }

        if (this.queue.running() > 0) {
            return QueueStatus.processing;
        }
    }
}
