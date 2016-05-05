///<reference path="../log2pc/enums.ts" />

'use strict';

import {QueueStatus, TransactionStatus, TaskType} from './enums';

export interface ILog2pcQueue {
    add(transaction: ILog2pcTransaction): void;
    isEmpty(): boolean;
    status(): QueueStatus;
}

export interface ILog2pcTransaction {
    status: TransactionStatus;
    tasks: Array<ILog2pcTask>;
}

export interface ILog2pcTask {
    type: TaskType;
    model: string;
}

export interface ILog2pcCreateTask extends ILog2pcTask {
    val: Object;
}

export interface ILog2pcUpdateTask extends ILog2pcTask {
    filter: Object;
    val: Object;
}

export interface ILog2pcDeleteTask extends ILog2pcTask {

}
