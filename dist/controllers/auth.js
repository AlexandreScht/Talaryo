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
const _OAuthToken = /*#__PURE__*/ _interop_require_default(require("../libs/OAuthToken"));
const _setToken = require("../libs/setToken");
const _validate = require("../libs/validate");
const _isHumain = /*#__PURE__*/ _interop_require_default(require("../middlewares/isHumain"));
const _mw = /*#__PURE__*/ _interop_require_default(require("../middlewares/mw"));
const _slowDown = /*#__PURE__*/ _interop_require_default(require("../middlewares/slowDown"));
const _validator = /*#__PURE__*/ _interop_require_default(require("../middlewares/validator"));
const _mailer = /*#__PURE__*/ _interop_require_default(require("../services/mailer"));
const _users = /*#__PURE__*/ _interop_require_default(require("../services/users"));
const _objection = require("objection");
const _typedi = require("typedi");
const _uuid = require("uuid");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const AuthController = ({ app })=>{
    const UserServices = _typedi.Container.get(_users.default);
    const MailerService = _typedi.Container.get(_mailer.default);
    app.post('/register', (0, _mw.default)([
        (0, _validator.default)({
            body: {
                email: _validate.emailValidator.required(),
                password: _validate.passwordValidator.required(),
                firstName: _validate.stringValidator.required(),
                lastName: _validate.stringValidator.required(),
                token: _validate.stringValidator.required()
            }
        }),
        (0, _isHumain.default)(),
        async ({ locals: { body: { email, password, firstName, lastName } }, res, next })=>{
            try {
                const [err] = await UserServices.findUserByEmail(email);
                if (!err) {
                    throw new _exceptions.InvalidArgumentError(`this email is already used`);
                }
                await (0, _objection.transaction)(UserServices.getModel, async (trx)=>{
                    const user = await UserServices.register({
                        email,
                        password,
                        firstName,
                        lastName
                    }, trx);
                    await MailerService.Confirmation(user.email, firstName, user.accessToken);
                    await trx.commit();
                });
                res.status(201).send({
                    result: 'Confirmation email has been sent'
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.post('/login', (0, _mw.default)([
        (0, _slowDown.default)(500),
        (0, _validator.default)({
            body: {
                email: _validate.emailValidator.required(),
                password: _validate.stringValidator.required(),
                token: _validate.stringValidator.required()
            }
        }),
        (0, _isHumain.default)(),
        async ({ locals: { body: { email, password } }, res, next })=>{
            try {
                const [err, user] = await UserServices.findUserByEmail(email);
                if (err) {
                    throw new _exceptions.NotFoundError(`Email or Password is incorrect`);
                }
                if (!user.validate) {
                    throw new _exceptions.InvalidSessionError('Please validate your account by mail');
                }
                await UserServices.login(user, password);
                const tokenData = await (0, _setToken.createToken)(user);
                const refreshToken = (0, _uuid.v4)();
                const cookie = (0, _setToken.createCookie)(user, refreshToken);
                await UserServices.setRefreshToken(user, refreshToken);
                res.setHeader('Set-Cookie', cookie);
                res.status(200).send({
                    payload: tokenData
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.post('/OAuth', (0, _mw.default)([
        (0, _validator.default)({
            body: {
                id_token: _validate.stringValidator.required(),
                at_hash: _validate.stringValidator.required(),
                name: _validate.stringValidator
            }
        }),
        async ({ locals: { body: { at_hash, id_token } }, res, next })=>{
            try {
                const [error, OAuthUser] = await (0, _OAuthToken.default)(id_token, at_hash);
                console.log(OAuthUser);
                if (error) {
                    throw new _exceptions.InvalidSessionError();
                }
                const [userNotFound, user] = await UserServices.findUserOAuth(OAuthUser.email);
                const currentUser = userNotFound ? await UserServices.register({
                    email: OAuthUser.email,
                    firstName: OAuthUser === null || OAuthUser === void 0 ? void 0 : OAuthUser.given_name,
                    lastName: OAuthUser === null || OAuthUser === void 0 ? void 0 : OAuthUser.family_name
                }) : user;
                const refreshToken = (0, _uuid.v4)();
                const tokenData = await (0, _setToken.createToken)(currentUser);
                const cookie = (0, _setToken.createCookie)(currentUser, refreshToken);
                await UserServices.setRefreshToken(currentUser, refreshToken);
                res.setHeader('Set-Cookie', cookie);
                res.status(201).send({
                    payload: tokenData
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
};
const _default = AuthController;

//# sourceMappingURL=auth.js.map