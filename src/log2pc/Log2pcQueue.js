///<reference path="../../typings/main.d.ts" />
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
        define(["require", "exports", 'async', 'events', './enums'], factory);
    }
})(function (require, exports) {
    'use strict';
    var async = require('async');
    var events_1 = require('events');
    var enums_1 = require('./enums');
    var Log2pcQueue = (function (_super) {
        __extends(Log2pcQueue, _super);
        function Log2pcQueue(connString) {
            _super.call(this);
            this.queue = async.queue(this.save);
        }
        Log2pcQueue.prototype.save = function (task, callback) {
            callback();
        };
        Log2pcQueue.prototype.add = function (transaction) {
            this.queue.push(transaction);
        };
        Log2pcQueue.prototype.isEmpty = function () {
            return this.queue.length() + this.queue.running() === 0;
        };
        Log2pcQueue.prototype.status = function () {
            if (this.queue.idle() || this.queue.running() === 0) {
                return enums_1.QueueStatus.ready;
            }
            if (this.queue.running() > 0) {
                return enums_1.QueueStatus.processing;
            }
        };
        return Log2pcQueue;
    }(events_1.EventEmitter));
    exports.Log2pcQueue = Log2pcQueue;
});
//# sourceMappingURL=Log2pcQueue.js.map