///<reference path="../typings/main.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'chai', 'immutable'], factory);
    }
})(function (require, exports) {
    'use strict';
    var chai_1 = require('chai');
    var immutable_1 = require('immutable');
    describe('immutability basic tests', function () {
        describe('a number', function () {
            var increment = function (currentState) {
                return currentState + 1;
            };
            it('is immutable', function () {
                var state = 42;
                var nextState = increment(state);
                chai_1.expect(nextState).to.equal(43);
                chai_1.expect(state).to.equal(42);
            });
        });
        describe('a list', function () {
            var addMovie = function (currentState, movie) {
                return currentState.push(movie);
            };
            it('is immutable', function () {
                var state = immutable_1.List.of('Trainspotting', '28 Days Later'), nextState = addMovie(state, 'Sunshine');
                chai_1.expect(nextState).to.equal(immutable_1.List.of('Trainspotting', '28 Days Later', 'Sunshine'));
                chai_1.expect(state).to.equal(immutable_1.List.of('Trainspotting', '28 Days Later'));
            });
        });
        describe('a tree', function () {
            var addMovie = function (currentState, movie) {
                return currentState.update('movies', function (movies) { return movies.push(movie); });
            };
            it('is immutable', function () {
                var state = immutable_1.Map({
                    movies: immutable_1.List.of('Trainspotting', '28 Days Later')
                }), nextState = addMovie(state, 'Sunshine');
                chai_1.expect(nextState).to.equal(immutable_1.Map({
                    movies: immutable_1.List.of('Trainspotting', '28 Days Later', 'Sunshine')
                }));
                chai_1.expect(state).to.equal(immutable_1.Map({
                    movies: immutable_1.List.of('Trainspotting', '28 Days Later')
                }));
            });
        });
    });
});
//# sourceMappingURL=immutableBasic.spec.js.map