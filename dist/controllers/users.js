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
const _validate = require("../libs/validate");
const _mw = /*#__PURE__*/ _interop_require_default(require("../middlewares/mw"));
const _validator = /*#__PURE__*/ _interop_require_default(require("../middlewares/validator"));
const _users = /*#__PURE__*/ _interop_require_default(require("../services/users"));
const _typedi = require("typedi");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const UsersController = ({ app })=>{
    const UserServices = _typedi.Container.get(_users.default);
    app.patch('/validate-account', (0, _mw.default)([
        (0, _validator.default)({
            body: {
                accessToken: _validate.stringValidator.required()
            }
        }),
        async ({ locals: { body: { accessToken } }, res, next })=>{
            try {
                await UserServices.ValidateUserAccount(accessToken);
                res.status(201).send({
                    message: 'Your account has been successfully validated'
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
};
const _default = UsersController;

//# sourceMappingURL=users.js.map