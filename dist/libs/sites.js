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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function sitesUri(s) {
    const { sites } = _config.default;
    const str = sites[s];
    if (!str) {
        throw new _exceptions.InvalidArgumentError(`the website << ${s} >> is not allowed !`);
    }
    return str;
}
const _default = sitesUri;

//# sourceMappingURL=sites.js.map