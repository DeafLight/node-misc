///<reference path="../typings/main.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'async', 'chai'], factory);
    }
})(function (require, exports) {
    'use strict';
    var async = require('async');
    var chai_1 = require('chai');
    describe('async queue test', function () {
        var t = [], q;
        beforeEach(function () { return q = async.queue(function (task, callback) {
            setTimeout(function () {
                t.push(task.res);
                callback();
            }, task.time);
        }, 4); });
        it('should execute all tasks', function (done) {
            async.parallel([
                function (callback) { return q.push({ time: 100, res: 1 }, callback); },
                function (callback) { return q.push({ time: 400, res: 4 }, callback); },
                function (callback) { return q.push({ time: 200, res: 2 }, callback); },
                function (callback) { return q.push({ time: 300, res: 3 }, callback); },
            ], function (err, result) {
                for (var i = 0, l = t.length; i < l; i++) {
                    chai_1.expect(t[i]).to.equal(i + 1);
                }
                done();
            });
        });
    });
});
//# sourceMappingURL=asyncQueue.spec.js.map