// apiRouter.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ApiRouter", {
    enumerable: true,
    get: function() {
        return ApiRouter;
    }
});
const _favFolders = /*#__PURE__*/ _interop_require_default(require("../controllers/favFolders"));
const _favoris = /*#__PURE__*/ _interop_require_default(require("../controllers/favoris"));
const _stripe = /*#__PURE__*/ _interop_require_default(require("../webhooks/stripe"));
const _auth = /*#__PURE__*/ _interop_require_default(require("../controllers/auth"));
const _scrapping = /*#__PURE__*/ _interop_require_default(require("../controllers/scrapping"));
const _users = /*#__PURE__*/ _interop_require_default(require("../controllers/users"));
const _express = require("express");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let ApiRouter = class ApiRouter {
    initializeRoutes() {
        (0, _auth.default)({
            app: this.router
        });
        (0, _users.default)({
            app: this.router
        });
        (0, _scrapping.default)({
            app: this.router
        });
        (0, _stripe.default)({
            app: this.router
        });
        (0, _favoris.default)({
            app: this.router
        });
        (0, _favFolders.default)({
            app: this.router
        });
    }
    constructor(){
        _define_property(this, "router", (0, _express.Router)());
        this.initializeRoutes();
    }
};

//# sourceMappingURL=prepareRoutes.js.map