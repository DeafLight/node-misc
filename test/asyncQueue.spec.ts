///<reference path="../typings/main.d.ts" />

'use strict';

import * as async from 'async';
import {expect} from 'chai';

interface Task {
    time: number;
    res: number;
}

describe('async queue test', () => {
    let t: Array<number> = [],
        q: AsyncQueue<Task>;

    beforeEach(() => q = async.queue((task: Task, callback) => {
        setTimeout(() => {
            t.push(task.res);
            callback();
        }, task.time);
    }, 4));

    it('should execute all tasks', done => {
        async.parallel([
            callback => q.push({ time: 100, res: 1 }, callback),
            callback => q.push({ time: 400, res: 4 }, callback),
            callback => q.push({ time: 200, res: 2 }, callback),
            callback => q.push({ time: 300, res: 3 }, callback),
        ], (err, result) => {
            for (let i = 0, l = t.length; i < l; i++) {
                expect(t[i]).to.equal(i + 1);
            }
            done();
        });
    });
});