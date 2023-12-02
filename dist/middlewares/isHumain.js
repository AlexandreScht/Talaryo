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
const _config = /*#__PURE__*/ _interop_require_default(require("../config"));
const _exceptions = require("../exceptions");
const _nodefetch = /*#__PURE__*/ _interop_require_default(require("node-fetch"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const isHumain = ()=>{
    return async (ctx)=>{
        const { next, locals } = ctx;
        try {
            const { body: { token } } = locals;
            const response = await (0, _nodefetch.default)(`https://www.google.com/recaptcha/api/siteverify?secret=${_config.default.reCaptcha}&response=${token}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (!data.success) {
                throw new _exceptions.InvalidIdentityError();
            }
            next();
        } catch (error) {
            throw new _exceptions.ServerException(500, error);
        }
    };
};
const _default = isHumain;

//# sourceMappingURL=isHumain.js.map