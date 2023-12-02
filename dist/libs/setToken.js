"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createCookie: function() {
        return createCookie;
    },
    createToken: function() {
        return createToken;
    }
});
const _config = /*#__PURE__*/ _interop_require_default(require("../config"));
const _cookie = /*#__PURE__*/ _interop_require_default(require("cookie"));
const _jose = require("jose");
const _jsonwebtoken = require("jsonwebtoken");
const _parseduration = /*#__PURE__*/ _interop_require_default(require("parse-duration"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createToken = async (user)=>{
    const { email, role, firstName } = user;
    const { security } = _config.default;
    const dataStoredInToken = {
        User: {
            role,
            firstName,
            email
        }
    };
    const expiresIn = (0, _parseduration.default)(security.EXPRESS_IN) / 1000; // convert string in secondes
    const token = await new _jose.SignJWT(dataStoredInToken).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().setExpirationTime(security.EXPRESS_IN).sign(new TextEncoder().encode(security.jwt.JWT_SECRET));
    return {
        expiresIn,
        jwt: token
    };
};
const createSession = (user, refreshToken)=>{
    const { id, role } = user;
    const { security } = _config.default;
    const dataStoredInToken = {
        user: {
            sessionId: id,
            sessionRole: role,
            refreshToken
        }
    };
    const expiresIn = (0, _parseduration.default)(security.EXPRESS_IN) / 1000;
    return {
        token: (0, _jsonwebtoken.sign)(dataStoredInToken, security.session.SESSION_SECRET, {
            expiresIn
        }),
        expiresIn
    };
};
const createCookie = (user, refreshToken)=>{
    const { FRONT_URL } = _config.default;
    const values = createSession(user, refreshToken);
    return _cookie.default.serialize('Authorization', values.token, {
        httpOnly: true,
        path: '/',
        domain: new URL(FRONT_URL).hostname,
        maxAge: values.expiresIn,
        secure: process.env.NODE_ENV === 'production'
    });
};

//# sourceMappingURL=setToken.js.map