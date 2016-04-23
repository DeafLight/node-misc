///<reference path="./src/typings/IAppConfig.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var MongoDBPoc;
    (function (MongoDBPoc) {
        MongoDBPoc.appConfig = {
            dbConnString: 'mongodb://localhost/ng2-sandbox',
        };
    })(MongoDBPoc = exports.MongoDBPoc || (exports.MongoDBPoc = {}));
});
