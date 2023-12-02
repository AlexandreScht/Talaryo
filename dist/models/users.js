"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserModel", {
    enumerable: true,
    get: function() {
        return UserModel;
    }
});
const _bcrypt = require("bcrypt");
const _objection = require("objection");
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
let UserModel = class UserModel extends _objection.Model {
    constructor(...args){
        super(...args);
        _define_property(this, "id", void 0);
        _define_property(this, "email", void 0);
        _define_property(this, "role", void 0);
        _define_property(this, "password", void 0);
        _define_property(this, "firstName", void 0);
        _define_property(this, "lastName", void 0);
        _define_property(this, "validate", void 0);
        _define_property(this, "accessToken", void 0);
        _define_property(this, "refreshToken", void 0);
        _define_property(this, "stripeCustomer", void 0);
        _define_property(this, "freeTrials", void 0);
        _define_property(this, "stripeBilling", void 0);
        _define_property(this, "freeTest", void 0);
        _define_property(this, "passwordReset", void 0);
        _define_property(this, "count", void 0);
        _define_property(this, "checkPassword", async (password)=>{
            return await (0, _bcrypt.compare)(password, this.password);
        });
    }
};
_define_property(UserModel, "tableName", 'users');
_define_property(UserModel, "idColumn", 'id');
_define_property(UserModel, "modifiers", {
    paginate: (query, limit, page)=>query.limit(limit).offset((page - 1) * limit)
});

//# sourceMappingURL=users.js.map