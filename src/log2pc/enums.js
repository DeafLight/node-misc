(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    'use strict';
    (function (QueueStatus) {
        QueueStatus[QueueStatus["ready"] = 0] = "ready";
        QueueStatus[QueueStatus["processing"] = 1] = "processing";
        QueueStatus[QueueStatus["error"] = 2] = "error";
    })(exports.QueueStatus || (exports.QueueStatus = {}));
    var QueueStatus = exports.QueueStatus;
    (function (TransactionStatus) {
        TransactionStatus[TransactionStatus["init"] = 0] = "init";
        TransactionStatus[TransactionStatus["pending"] = 1] = "pending";
        TransactionStatus[TransactionStatus["applied"] = 2] = "applied";
        TransactionStatus[TransactionStatus["done"] = 3] = "done";
    })(exports.TransactionStatus || (exports.TransactionStatus = {}));
    var TransactionStatus = exports.TransactionStatus;
    (function (TaskType) {
        TaskType[TaskType["create"] = 0] = "create";
        TaskType[TaskType["update"] = 1] = "update";
        TaskType[TaskType["delete"] = 2] = "delete";
    })(exports.TaskType || (exports.TaskType = {}));
    var TaskType = exports.TaskType;
});
//# sourceMappingURL=enums.js.map