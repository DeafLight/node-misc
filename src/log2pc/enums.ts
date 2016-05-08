'use strict';

export enum Log2pcManagerStatus {
    connecting = 1,
    connected = 2,
    disconnecting = 3,
    disconnected = 4,
    error = -1
}

export enum QueueStatus {
    ready = 1,
    processing = 2,
    error = -1
}

export enum TransactionStatus {
    init = 1,
    pending = 2,
    applied = 3,
    done = 4,
    cancelling = -2,
    cancelled = -3,
    undone = -4
}

export enum TaskType {
    create = 1,
    update = 2,
    delete = 3
}
