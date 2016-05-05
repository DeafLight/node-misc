///<reference path="../typings/main.d.ts" />

'use strict';

import {expect} from 'chai';
import {List, Map} from 'immutable';

describe('immutability basic tests', () => {
    describe('a number', () => {
        let increment = (currentState) => {
            return currentState + 1;
        };

        it('is immutable', () => {
            let state = 42;
            let nextState = increment(state);

            expect(nextState).to.equal(43);
            expect(state).to.equal(42);
        });
    });

    describe('a list', () => {
        let addMovie = (currentState, movie) => {
            return currentState.push(movie);
        }

        it('is immutable', () => {
            let state = List.of('Trainspotting', '28 Days Later'),
                nextState = addMovie(state, 'Sunshine');

            expect(nextState).to.equal(List.of(
                'Trainspotting',
                '28 Days Later',
                'Sunshine'
            ));

            expect(state).to.equal(List.of(
                'Trainspotting',
                '28 Days Later'
            ));
        });
    });

    describe('a tree', () => {
        let addMovie = (currentState, movie) => {
            return currentState.update('movies', movies => movies.push(movie));
        }

        it('is immutable', () => {
            let state = Map({
                movies: List.of('Trainspotting', '28 Days Later')
            }),
                nextState = addMovie(state, 'Sunshine');

            expect(nextState).to.equal(Map({
                movies: List.of(
                    'Trainspotting',
                    '28 Days Later',
                    'Sunshine'
                )
            }));

            expect(state).to.equal(Map({
                movies: List.of(
                    'Trainspotting',
                    '28 Days Later'
                )
            }));
        });
    });
});