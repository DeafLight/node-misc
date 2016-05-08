(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    'use strict';
    (function (Log2pcManagerStatus) {
        Log2pcManagerStatus[Log2pcManagerStatus["connecting"] = 1] = "connecting";
        Log2pcManagerStatus[Log2pcManagerStatus["connected"] = 2] = "connected";
        Log2pcManagerStatus[Log2pcManagerStatus["disconnecting"] = 3] = "disconnecting";
        Log2pcManagerStatus[Log2pcManagerStatus["disconnected"] = 4] = "disconnected";
        Log2pcManagerStatus[Log2pcManagerStatus["error"] = -1] = "error";
    })(exports.Log2pcManagerStatus || (exports.Log2pcManagerStatus = {}));
    var Log2pcManagerStatus = exports.Log2pcManagerStatus;
    (function (QueueStatus) {
        QueueStatus[QueueStatus["ready"] = 1] = "ready";
        QueueStatus[QueueStatus["processing"] = 2] = "processing";
        QueueStatus[QueueStatus["error"] = -1] = "error";
    })(exports.QueueStatus || (exports.QueueStatus = {}));
    var QueueStatus = exports.QueueStatus;
    (function (TransactionStatus) {
        TransactionStatus[TransactionStatus["init"] = 1] = "init";
        TransactionStatus[TransactionStatus["pending"] = 2] = "pending";
        TransactionStatus[TransactionStatus["applied"] = 3] = "applied";
        TransactionStatus[TransactionStatus["done"] = 4] = "done";
        TransactionStatus[TransactionStatus["cancelling"] = -2] = "cancelling";
        TransactionStatus[TransactionStatus["cancelled"] = -3] = "cancelled";
        TransactionStatus[TransactionStatus["undone"] = -4] = "undone";
    })(exports.TransactionStatus || (exports.TransactionStatus = {}));
    var TransactionStatus = exports.TransactionStatus;
    (function (TaskType) {
        TaskType[TaskType["create"] = 1] = "create";
        TaskType[TaskType["update"] = 2] = "update";
        TaskType[TaskType["delete"] = 3] = "delete";
    })(exports.TaskType || (exports.TaskType = {}));
    var TaskType = exports.TaskType;
});
//# sourceMappingURL=enums.js.map