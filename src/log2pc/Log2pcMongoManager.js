///<reference path="../../typings/main.d.ts" />
///<reference path="../typings/IDisposable.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'mongodb', './enums', 'events'], factory);
    }
})(function (require, exports) {
    'use strict';
    var mongodb_1 = require('mongodb');
    var enums_1 = require('./enums');
    var events_1 = require('events');
    var Log2pcMongoManager = (function (_super) {
        __extends(Log2pcMongoManager, _super);
        function Log2pcMongoManager(connectionString, transactionCollection, callback) {
            var _this = this;
            _super.call(this);
            this._status = enums_1.Log2pcManagerStatus.connecting;
            new mongodb_1.MongoClient().connect(connectionString, function (err, result) {
                _this._db = result;
                _this._transactionCollection = _this._db.collection(transactionCollection);
                _this._status = enums_1.Log2pcManagerStatus.connected;
                callback && callback(err, result);
            });
        }
        Log2pcMongoManager.prototype.runTransaction = function (tasks, callback) {
            var _this = this;
            if (!tasks) {
                // TODO : ?
                throw 'not implemented';
            }
            if (tasks.length === 1) {
                var task = tasks[0];
                switch (task.type) {
                    case enums_1.TaskType.create:
                        var createTask = task;
                        this._db.collection(createTask.model).insert(createTask.val, function (err, result) { return _this.emit('done'); });
                        break;
                    default:
                        // TODO : deal with other types
                        throw 'not implemented';
                }
            }
            else {
                // TODO : 2 phase commit
                throw 'not implemented';
            }
        };
        Log2pcMongoManager.prototype.dispose = function (callback) {
            var _this = this;
            this._status = enums_1.Log2pcManagerStatus.disconnecting;
            this._db.close(function (err, result) {
                _this._status = enums_1.Log2pcManagerStatus.disconnected;
                callback && callback(err, result);
            });
        };
        Object.defineProperty(Log2pcMongoManager.prototype, "status", {
            get: function () { return this._status; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Log2pcMongoManager.prototype, "db", {
            get: function () { return this._db; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Log2pcMongoManager.prototype, "transactionCollection", {
            get: function () { return this._transactionCollection; },
            enumerable: true,
            configurable: true
        });
        return Log2pcMongoManager;
    }(events_1.EventEmitter));
    exports.Log2pcMongoManager = Log2pcMongoManager;
});
//# sourceMappingURL=Log2pcMongoManager.js.map