///<reference path="../typings/chai/chai.d.ts" />
///<reference path="../src/typings/chai-immutable.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'chai', 'chai-immutable'], factory);
    }
})(function (require, exports) {
    'use strict';
    var chai = require('chai');
    var chaiImmutable = require('chai-immutable');
    chai.use(chaiImmutable);
});
//# sourceMappingURL=testHelper.js.map