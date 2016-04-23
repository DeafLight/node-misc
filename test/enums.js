(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    'use strict';
    // http://mongoosejs.com/docs/api.html#connection_Connection-readyState
    (function (MongooseReadyState) {
        MongooseReadyState[MongooseReadyState["Disconnected"] = 0] = "Disconnected";
        MongooseReadyState[MongooseReadyState["Connected"] = 1] = "Connected";
        MongooseReadyState[MongooseReadyState["Connecting"] = 2] = "Connecting";
        MongooseReadyState[MongooseReadyState["Disconnecting"] = 3] = "Disconnecting";
    })(exports.MongooseReadyState || (exports.MongooseReadyState = {}));
    var MongooseReadyState = exports.MongooseReadyState;
});
//# sourceMappingURL=enums.js.map