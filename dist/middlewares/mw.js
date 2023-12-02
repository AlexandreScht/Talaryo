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
const _config = /*#__PURE__*/ _interop_require_default(require("../config"));
const _users = /*#__PURE__*/ _interop_require_default(require("../services/users"));
const _deepmerge = /*#__PURE__*/ _interop_require_default(require("deepmerge"));
const _jsonwebtoken = require("jsonwebtoken");
const _typedi = /*#__PURE__*/ _interop_require_default(require("typedi"));
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const { security } = _config.default;
const getAuthorization = (req)=>{
    const coockie = req.cookies['Authorization'];
    if (coockie) return coockie;
    const header = req.header('Authorization');
    if (header) return header.split('Bearer ')[1];
    return null;
};
const getUser = (Authorization)=>{
    try {
        const data = (0, _jsonwebtoken.verify)(Authorization, security.session.SESSION_SECRET);
        const user = _object_spread_props(_object_spread({}, data.user), {
            sessionId: Number.parseInt(data.user.sessionId)
        });
        return [
            false,
            user
        ];
    } catch (error) {
        return [
            error
        ];
    }
};
const mw = (middlewaresHandler)=>async (req, res, nextExpress)=>{
        const locals = {};
        const session = {};
        let handlerIndex = 0;
        const ctx = {
            req,
            res,
            get locals () {
                return locals;
            },
            set locals (newLocals){
                Object.assign(locals, (0, _deepmerge.default)(locals, newLocals));
            },
            get session () {
                return session;
            },
            set session (newSession){
                Object.assign(session, (0, _deepmerge.default)(session, newSession));
            },
            next: async (err)=>{
                try {
                    if (err && err instanceof Error) {
                        nextExpress(err);
                    } else {
                        const handler = middlewaresHandler[handlerIndex];
                        handlerIndex += 1;
                        await handler(ctx);
                    }
                } catch (error) {
                    nextExpress(error);
                }
            }
        };
        try {
            const UserServices = _typedi.default.get(_users.default);
            const Authorization = getAuthorization(req);
            if (Authorization) {
                const [err, user] = getUser(Authorization);
                if (err) {
                    throw new _exceptions.ExpiredSessionError();
                }
                await UserServices.checkRefreshToken(user);
                ctx.session = user;
            }
            await ctx.next();
        } catch (err) {
            nextExpress(err);
        }
    };
const _default = mw;

//# sourceMappingURL=mw.js.map