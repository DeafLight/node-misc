'use strict';

export enum QueueStatus {
    ready = 0,
    processing = 1,
    error = 2
}

export enum TransactionStatus {
    init = 0,
    pending = 1,
    applied = 2,
    done = 3
}

export enum TaskType {
    create = 0,
    update = 1,
    delete = 2
}
