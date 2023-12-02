"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _exceptions = require("../exceptions");
const auth = (role)=>{
    return async (ctx)=>{
        const { next, session } = ctx;
        if (!(session === null || session === void 0 ? void 0 : session.sessionId)) {
            throw new _exceptions.ExpiredSessionError();
        }
        if (role && session.sessionRole !== role && !role.includes(session.sessionRole)) {
            throw new _exceptions.InvalidAccessError();
        }
        next();
    };
};
const _default = auth;

//# sourceMappingURL=auth.js.map