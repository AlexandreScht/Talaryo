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
const _users = require("../models/users");
const _bcrypt = require("bcrypt");
const _typedi = require("typedi");
const _uuid = require("uuid");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let UsersServiceFile = class UsersServiceFile {
    get getModel() {
        return _users.UserModel.knex();
    }
    async findUserById(id) {
        try {
            const findUser = await _users.UserModel.query().findById(id);
            if (!findUser) {
                return [
                    true
                ];
            }
            return [
                false,
                findUser
            ];
        } catch (err) {
            throw new _exceptions.ServicesError();
        }
    }
    async findUserByEmail(email) {
        try {
            const findUser = await _users.UserModel.query().findOne({
                email
            });
            if (!findUser) {
                return [
                    true
                ];
            }
            return [
                false,
                findUser
            ];
        } catch (error) {
            console.log(error);
            throw new _exceptions.ServicesError();
        }
    }
    async findUserOAuth(email) {
        try {
            const findUser = await _users.UserModel.query().findOne({
                email
            }).whereNull('password');
            if (!findUser) {
                return [
                    true
                ];
            }
            return [
                false,
                findUser
            ];
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
    }
    async register(userData, trx) {
        try {
            if (userData === null || userData === void 0 ? void 0 : userData.password) {
                const hashedPassword = await (0, _bcrypt.hash)(userData.password, 10);
                return await _users.UserModel.query(trx).insert(_object_spread_props(_object_spread({}, userData), {
                    password: hashedPassword,
                    accessToken: (0, _uuid.v4)().replace(/-/g, '')
                }));
            }
            return await _users.UserModel.query().insert(_object_spread_props(_object_spread({}, userData), {
                validate: true
            }));
        } catch (error) {
            console.log(error);
            throw new _exceptions.ServicesError();
        }
    }
    async login(userData, password) {
        try {
            if (await userData.checkPassword(password)) {
                return userData;
            }
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
        throw new _exceptions.InvalidCredentialsError('Email or Password is incorrect');
    }
    async setRefreshToken(userData, refreshToken) {
        try {
            const updatedCount = await _users.UserModel.query().findById(userData.id).update({
                refreshToken
            });
            if (updatedCount) return;
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
        throw new _exceptions.InvalidSessionError();
    }
    async checkRefreshToken(userData) {
        try {
            const user = await _users.UserModel.query().findById(userData.sessionId).select('refreshToken');
            if (user && user.refreshToken === userData.refreshToken) return;
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
        throw new _exceptions.ExpiredSessionError();
    }
    async ValidateUserAccount(token) {
        try {
            const updatedCount = await _users.UserModel.query().where('accessToken', token).where('validate', false).patch({
                validate: true,
                accessToken: null
            });
            if (updatedCount) return;
        } catch (error) {
            console.log(error);
            throw new _exceptions.ServicesError();
        }
        throw new _exceptions.InvalidSessionError();
    }
};
UsersServiceFile = _ts_decorate([
    (0, _typedi.Service)()
], UsersServiceFile);
const _default = UsersServiceFile;

//# sourceMappingURL=users.js.map