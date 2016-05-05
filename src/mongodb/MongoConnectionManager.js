(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    'use strict';
    var MongoConnectionManager = (function () {
        function MongoConnectionManager() {
            if (MongoConnectionManager.instance) {
                throw new Error("Error: use MongoConnectionManager.instance");
            }
        }
        Object.defineProperty(MongoConnectionManager, "instance", {
            get: function () {
                if (!MongoConnectionManager._instance) {
                    MongoConnectionManager._instance = new MongoConnectionManager();
                }
                return MongoConnectionManager._instance;
            },
            enumerable: true,
            configurable: true
        });
        return MongoConnectionManager;
    }());
    exports.MongoConnectionManager = MongoConnectionManager;
});
//# sourceMappingURL=MongoConnectionManager.js.map